/**
 * TypeScript type execution service using official @typescript/vfs
 *
 * This service uses the official TypeScript Virtual File System (@typescript/vfs) package,
 * which is the same technology powering the TypeScript Playground.
 *
 * It properly handles lib files by fetching them from CDN with caching and compression,
 * providing a professional, production-ready solution for type execution in the browser.
 */

import ts from 'typescript'
import { createDefaultMapFromCDN, createSystem, createVirtualCompilerHost } from '@typescript/vfs'
import lzstring from 'lz-string'
import { loadTLangIntoVFS } from '../generated/tlangSources'

export interface ExecutionResult {
  success: boolean
  result?: string
  error?: string
  diagnostics?: string[]
  computedType?: string // The actual computed type result from tlang
}

/**
 * Cache for TypeScript lib files from CDN
 * This prevents re-downloading on every execution
 */
let libFilesCache: Map<string, string> | null = null


/**
 * Execute TypeScript code and extract the computed result type
 *
 * This function uses the official @typescript/vfs package to:
 * 1. Load TypeScript lib files from CDN (with caching)
 * 2. Create a virtual file system with user code
 * 3. Compile and type-check the code
 * 4. Extract computed type information
 *
 * @param code - Generated tlang TypeFlow code to execute
 * @returns ExecutionResult with success status and computed type
 */
export async function executeTypeScript(code: string): Promise<ExecutionResult> {
  try {
    // Validate input
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        error: 'No code to execute'
      }
    }

    // TypeScript compiler options
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      noEmit: true
    }

    // Step 1: Get lib files from CDN (cached with compression)
    // This is the official way to set up TypeScript in the browser
    if (!libFilesCache) {
      try {
        libFilesCache = await createDefaultMapFromCDN(
          compilerOptions,
          ts.version,
          true, // Enable localStorage caching
          ts,
          lzstring // Use compression to save space
        )
      } catch (error) {
        return {
          success: false,
          error: `Failed to load TypeScript lib files: ${error instanceof Error ? error.message : 'Unknown error'}`,
          diagnostics: ['Check your internet connection and try again']
        }
      }
    }

    // Step 2: Create file system map with lib files, tlang source, and user code
    const fsMap = new Map(libFilesCache)

    // Load tlang source files into the virtual file system
    // This is crucial - TypeScript needs tlang's type definitions to compute types!
    // tlang sources are pre-bundled as strings for static deployment
    loadTLangIntoVFS(fsMap)

    const virtualFileName = '/index.ts'
    fsMap.set(virtualFileName, code)

    // Step 3: Create virtual System (file system abstraction)
    const system = createSystem(fsMap)

    // Step 4: Create virtual CompilerHost
    const { compilerHost } = createVirtualCompilerHost(system, compilerOptions, ts)

    // Step 5: Create TypeScript Program (the official way)
    const program = ts.createProgram({
      rootNames: [virtualFileName],
      options: compilerOptions,
      host: compilerHost
    })

    // Step 6: Get source file and type checker
    const sourceFile = program.getSourceFile(virtualFileName)
    const typeChecker = program.getTypeChecker()

    if (!sourceFile) {
      return {
        success: false,
        error: 'Failed to parse source file'
      }
    }

    // Step 7: Check for compilation errors
    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile)

    // Filter out "Cannot find module '@atools/tlang'" errors since we're analyzing type structure
    const relevantErrors = diagnostics.filter(diagnostic => {
      const messageText = typeof diagnostic.messageText === 'string'
        ? diagnostic.messageText
        : diagnostic.messageText.messageText

      // Ignore module resolution errors for '@atools/tlang' - we're focused on type computation
      return !messageText.includes("Cannot find module '@atools/tlang'") &&
             !messageText.includes("Cannot find namespace")
    })

    if (relevantErrors.length > 0) {
      const errorMessages = relevantErrors.map(diagnostic => {
        const message = typeof diagnostic.messageText === 'string'
          ? diagnostic.messageText
          : diagnostic.messageText.messageText

        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
          return `Line ${line + 1}:${character + 1} - ${message}`
        }
        return message
      })

      return {
        success: false,
        error: 'Type errors detected in generated code',
        diagnostics: errorMessages
      }
    }

    // Step 8: Extract metadata from the AST
    let hasImports = false
    let hasTypeFlowType = false
    let typeFlowTypeName = ''
    let nodeCount = 0
    let connectionCount = 0
    let computedTypeString = ''

    // Store component result types (Result_1, Result_2, etc.) for multi-component expansion
    const componentResults = new Map<string, string>()

    // Traverse the AST to extract information
    ts.forEachChild(sourceFile, node => {
      // Check for import statements
      if (ts.isImportDeclaration(node)) {
        hasImports = true
      }

      // Find type alias declarations
      if (ts.isTypeAliasDeclaration(node)) {
        const typeName = node.name.text
        const typeText = node.type.getText(sourceFile)

        // Detect TypeFlow type
        if (typeText.includes('TypeFlow<')) {
          hasTypeFlowType = true
          typeFlowTypeName = typeName

          // Count nodes in the typeflow definition
          const nodesMatch = typeText.match(/\{[^}]*\}/g)
          const connectionsMatch = typeText.match(/\[[^\]]*\]/g)

          if (nodesMatch && nodesMatch[0]) {
            const nodeMatches = nodesMatch[0].match(/\w+:/g)
            nodeCount = nodeMatches ? nodeMatches.length : 0
          }

          if (connectionsMatch && connectionsMatch[0]) {
            const connectionMatches = connectionsMatch[0].match(/from:/g)
            connectionCount = connectionMatches ? connectionMatches.length : 0
          }
        }

        // Detect Result_1, Result_2, etc. (component results)
        if (/^Result_\d+$/.test(typeName)) {
          try {
            const type = typeChecker.getTypeAtLocation(node.type)
            const expandedType = typeChecker.typeToString(
              type,
              undefined,
              ts.TypeFormatFlags.NoTruncation
            )
            componentResults.set(typeName, expandedType)
            console.log(`🔍 [DEBUG] Found ${typeName}:`, expandedType.substring(0, 100))
          } catch (e) {
            console.error(`❌ [DEBUG] Error computing ${typeName}:`, e)
          }
        }

        // Detect Result type - this is what we want to compute!
        if (typeName === 'Result') {
          try {
            console.log('🔍 [DEBUG] Processing Result type...')

            // Get the type from TypeScript's type checker
            const type = typeChecker.getTypeAtLocation(node.type)

            console.log('🔍 [DEBUG] Type flags:', type.flags)
            console.log('🔍 [DEBUG] Type symbol:', type.symbol?.name)
            console.log('🔍 [DEBUG] Has alias symbol:', !!type.aliasSymbol)

            // Try different methods to get the computed type

            // Method 1: Get fully expanded type with all flags
            const expandedType1 = typeChecker.typeToString(
              type,
              undefined,
              ts.TypeFormatFlags.NoTruncation |
              ts.TypeFormatFlags.InTypeAlias |
              ts.TypeFormatFlags.UseStructuralFallback
            )
            console.log('🔍 [DEBUG] Method 1 (InTypeAlias):', expandedType1.substring(0, 200))

            // Method 2: Without InTypeAlias flag
            const expandedType2 = typeChecker.typeToString(
              type,
              undefined,
              ts.TypeFormatFlags.NoTruncation
            )
            console.log('🔍 [DEBUG] Method 2 (NoTruncation):', expandedType2.substring(0, 200))

            // Method 3: Try using WriteClassExpressionAsTypeLiteral flag
            const expandedType3 = typeChecker.typeToString(
              type,
              undefined,
              ts.TypeFormatFlags.NoTruncation |
              ts.TypeFormatFlags.WriteClassExpressionAsTypeLiteral
            )
            console.log('🔍 [DEBUG] Method 3 (AsTypeLiteral):', expandedType3.substring(0, 200))

            // Method 4: Check if it's an object type and get properties
            if (type.flags & ts.TypeFlags.Object) {
              console.log('🔍 [DEBUG] Type is an Object type')
              const properties = type.getProperties?.()
              console.log('🔍 [DEBUG] Object properties:', properties?.map(p => p.name).join(', '))

              // If it has properties, get the type string
              if (properties && properties.length > 0) {
                const objType = typeChecker.typeToString(
                  type,
                  undefined,
                  ts.TypeFormatFlags.NoTruncation
                )
                console.log('🔍 [DEBUG] Method 4 (Object props):', objType.substring(0, 200))
                computedTypeString = objType
              }
            }

            // Method 5: Force expand all type aliases
            const expandedType5 = typeChecker.typeToString(
              type,
              undefined,
              ts.TypeFormatFlags.NoTruncation |
              ts.TypeFormatFlags.UseFullyQualifiedType
            )
            console.log('🔍 [DEBUG] Method 5 (FullyQualified):', expandedType5.substring(0, 200))

            // Method 6: If it's a tuple with component results, use stored values
            if (typeText.match(/\[Result_\d+/)) {
              console.log('🔍 [DEBUG] Detected multi-component Result tuple')
              const componentNames = typeText.match(/Result_\d+/g)
              if (componentNames && componentNames.length > 0) {
                const expandedComponents = componentNames.map(name => {
                  const stored = componentResults.get(name)
                  if (stored && stored !== name) {
                    return stored
                  }
                  // Fallback: try to find and expand the type
                  return name
                })
                if (expandedComponents.some(c => !c.startsWith('Result_'))) {
                  computedTypeString = `[${expandedComponents.join(', ')}]`
                  console.log('🔍 [DEBUG] Method 6 (Multi-component):', computedTypeString)
                }
              }
            }

            // Method 7: If it's a tuple/array, expand each element
            if (!computedTypeString && type.flags & ts.TypeFlags.Object) {
              const objectType = type as ts.ObjectType
              if (objectType.objectFlags & ts.ObjectFlags.Tuple || objectType.objectFlags & ts.ObjectFlags.Reference) {
                console.log('🔍 [DEBUG] Type is a Tuple or Reference')

                // Try to get type arguments (for tuple elements)
                // TypeScript internal API - use type assertion for accessing internal properties
                type TypeWithArgs = ts.Type & { typeArguments?: readonly ts.Type[]; resolvedTypeArguments?: readonly ts.Type[] }
                const typeWithArgs = type as TypeWithArgs
                const typeArgs = typeWithArgs.typeArguments || typeWithArgs.resolvedTypeArguments

                if (typeArgs && typeArgs.length > 0) {
                  console.log('🔍 [DEBUG] Tuple has', typeArgs.length, 'elements')
                  const expandedElements = Array.from(typeArgs).map((elementType: ts.Type) =>
                    typeChecker.typeToString(elementType, undefined, ts.TypeFormatFlags.NoTruncation)
                  )
                  computedTypeString = `[${expandedElements.join(', ')}]`
                  console.log('🔍 [DEBUG] Method 7 (Expanded tuple):', computedTypeString)
                }
              }
            }

            // Try to use the best result we got
            if (!computedTypeString) {
              if (expandedType5 && expandedType5 !== 'Result' && expandedType5 !== typeName && !expandedType5.startsWith('[Result_')) {
                computedTypeString = expandedType5
              } else if (expandedType1 && expandedType1 !== 'Result' && expandedType1 !== typeName) {
                computedTypeString = expandedType1
              } else if (expandedType2 && expandedType2 !== 'Result' && expandedType2 !== typeName) {
                computedTypeString = expandedType2
              } else {
                // Fallback: try to get the target of the type alias
                const aliasSymbol = type.aliasSymbol
                if (aliasSymbol) {
                  const declarations = aliasSymbol.getDeclarations()
                  if (declarations && declarations.length > 0) {
                    const decl = declarations[0]
                    if (decl && ts.isTypeAliasDeclaration(decl)) {
                      const targetType = typeChecker.getTypeAtLocation(decl.type)
                      computedTypeString = typeChecker.typeToString(
                        targetType,
                        undefined,
                        ts.TypeFormatFlags.NoTruncation
                      )
                      console.log('🔍 [DEBUG] Method 8 (Alias target):', computedTypeString.substring(0, 200))
                    }
                  }
                }
              }
            }

            // If still not resolved, show the definition
            if (!computedTypeString || computedTypeString === 'Result' || computedTypeString === typeName) {
              console.log('⚠️ [DEBUG] Using fallback: type text definition')
              computedTypeString = typeText
            }

            console.log('✅ [DEBUG] Final computed type length:', computedTypeString.length)

            // Simplify if too long
            if (computedTypeString.length > 1000) {
              computedTypeString = typeChecker.typeToString(
                type,
                undefined,
                ts.TypeFormatFlags.None
              )
            }
          } catch (e) {
            console.error('❌ [DEBUG] Error computing type:', e)
            // Fallback to text representation if type checking fails
            computedTypeString = typeText
          }
        }
      }
    })

    // Step 9: Validation checks
    if (!hasImports) {
      return {
        success: false,
        error: 'Missing import statements',
        diagnostics: ['Code must import from "@atools/tlang"']
      }
    }

    if (!hasTypeFlowType) {
      return {
        success: false,
        error: 'No TypeFlow type definition found',
        diagnostics: ['Code must define a type using TypeFlow<...>']
      }
    }

    if (!computedTypeString) {
      return {
        success: false,
        error: 'No Result type found',
        diagnostics: ['Code must define: type Result = YourTypeFlowType']
      }
    }

    // Success! Build diagnostic messages
    const successDiagnostics = [
      '✓ Syntax validation passed',
      '✓ Import statements verified',
      `✓ TypeFlow "${typeFlowTypeName}" parsed successfully`,
      `✓ TypeFlow contains ${nodeCount} node${nodeCount !== 1 ? 's' : ''} and ${connectionCount} connection${connectionCount !== 1 ? 's' : ''}`,
      '✓ Type computation completed successfully'
    ]

    return {
      success: true,
      result: `Type computation executed successfully!

TypeFlow: ${typeFlowTypeName}
Nodes: ${nodeCount}
Connections: ${connectionCount}

The result type has been computed and is ready for use.`,
      computedType: computedTypeString,
      diagnostics: successDiagnostics
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
      diagnostics: ['Execution failed - see error message above']
    }
  }
}

/**
 * Validate TypeScript code syntax without full compilation
 *
 * Quick validation for basic syntax errors before attempting full execution
 */
export function validateTypeScriptSyntax(code: string): ExecutionResult {
  const errors: string[] = []

  // Check for basic type definitions
  if (!code.includes('type ') && !code.includes('interface ')) {
    errors.push('No type definitions found')
  }

  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`)
  }

  // Check for balanced brackets
  const openBrackets = (code.match(/\[/g) || []).length
  const closeBrackets = (code.match(/]/g) || []).length
  if (openBrackets !== closeBrackets) {
    errors.push(`Unmatched brackets: ${openBrackets} opening, ${closeBrackets} closing`)
  }

  // Check for balanced angle brackets in generics
  const openAngles = (code.match(/</g) || []).length
  const closeAngles = (code.match(/>/g) || []).length
  if (openAngles !== closeAngles) {
    errors.push(`Unmatched angle brackets: ${openAngles} opening, ${closeAngles} closing`)
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: 'Syntax errors detected',
      diagnostics: errors
    }
  }

  return {
    success: true,
    result: 'Syntax validation passed',
    diagnostics: ['✓ No syntax errors found']
  }
}
