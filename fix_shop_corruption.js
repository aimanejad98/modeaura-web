const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'app', 'shop', 'page.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('Original size:', content.length);

    // 1. Fix double braces }} -> }
    // We loop this because }}}} might become }} then }
    let lastContent = '';
    while (content !== lastContent) {
        lastContent = content;
        // specifically target }} that are not part of valid syntax like {{ }} for variables in JSX?
        // But in JSX {{ }} is for objects. 
        // Example: style={{ color: 'red' }}
        // If we blindly replace }} with }, we break style={{}}.

        // However, the corruption seems to be text like `({selected.length}}`.
        // This is not an object.

        // Strategy: Replace }} with } ONLY if not preceded by { ?
        // Or look for specific bad patterns seen in the file.

        // The pattern `}}` at end of line or before whitespace seems common in the corrupted parts.
        // Let's rely on the fact that `}}` is rare except in logical comparisons (not `>>`, but we don't have `}}` operator) or object literals in JSX `{{`.

        // Let's replace `}}` with `}` but protect `{{`.
        // Actually, let's fix the tailwind classes first as that is distinct.
    }

    // Fix malformed tailwind classes (spaces around hyphens)
    // Example: "transition - transform" -> "transition-transform"
    content = content.replace(/([a-zA-Z0-9])\s-\s([a-zA-Z0-9])/g, '$1-$2');

    // Fix specific double braces seen in diagnosis
    // `})</span>}}` -> `})</span>}`
    content = content.replace(/}\)\s*<\/span>\s*}}/g, '})</span>}');

    // `({selected.length}}` -> `({selected.length})`
    content = content.replace(/\({selected\.length}}/g, '({selected.length})');

    // `<ChevronDown size={14}}` -> `<ChevronDown size={14} />`
    // It seems the `/>` is pushed to next lines sometimes.
    // Line 705: <ChevronDown size={14}}
    // Line 712: } />
    // We clean up `}}` inside JSX props?

    // Generic Fix: Remove `}` that appears to be "extra" at end of lines?
    // This is hard.

    // Let's look at the `loadData();} ... },` pattern.
    // Replace `;} \s* \n \s* },` with `},` ?
    // No, `loadData();}` is likely `loadData();`. The `}` closes the function.
    // `loadData();} \n ... }, []` -> `loadData(); \n }, []`

    // Basic cleanup: Replace `}}` that are NOT `}}` (end of object in JSX).
    // How to distinguish? `}}` usually implies `{{`.
    // If we have `val}}` that is likely wrong unless `val` is part of object `{{ val }}`.
    // But `val}}` -> object `val`? No `val` is key/value? `{{ val: 1 }}`.

    // Let's replace `}}` with `}` globally, but then fix `{{` occurrences if we broke them?
    // Actually, `{{` becomes `{`? No. `}}` is the closer.
    // If I have `style={{ color: 'red' }}`, replacing `}}` -> `}` gives `style={{ color: 'red' }`. Syntax error.

    // But the corruption `({selected.length}}` is definitely bad.

    // Transform: `([a-zA-Z0-9_.'")])}}` -> `$1}` (replaces `}}` after a char with `}`)
    // This handles `length}}` -> `length}`.
    // Does it break `style={{ color: 'red'}}`? 'd'}} -> 'd'} ? Yes.

    // Maybe checking if the corresponding opener `{{` exists is too hard with regex.

    // Let's try to remove `}` explicitly for the known garbage locations:
    // 1. `}}` at the end of lines where it looks like closing tags.
    // 2. `\s+}` repeated lines.

    // Remove "floating" braces that are causing the `Parsing ecmascript source code failed`
    // The error was line 64: `Expected ',', got '}'`
    // 62: loadData();}
    // 64: }, []);

    // This is valid if `loadData();` is the only statement.
    // `useEffect(() => { loadData();} \n \n }, []);`
    // The previous analysis said this was valid?
    // `useEffect(() => { stmt; } , deps)`
    // Wait, if line 62 has `}`, then line 64 `}` closes `useEffect`?? No.
    // `useEffect(fn, deps)`
    // `fn` = `() => { loadData(); }`
    // `deps` = `[]`
    // So `useEffect(() => { loadData(); }, []);`
    // If line 64 starts with `}, []`, and line 62 ends with `}`, then:
    // `useEffect(() => { loadData(); } \n \n }, []);` -> `useEffect(..., ... }, []);`
    // Double `}`. One from line 62, one from line 64.
    // THIS IS THE ERROR.

    // Fix: Remove `}` from line 62 if line 64 has `}`? 
    // Or just look for `;} \s* \n* \s* },` and replace with `; \n },` ?

    content = content.replace(/;\}\s*(\r\n|\n|\r)\s*\},/g, ';$1        },');

    // Also `catch` block error in diagnosis.
    // 91: } catch (error) {
    // 89: ... setPriceRange([0, maxPrice]);}
    // 97: }}}

    // 89: `setPriceRange(...);}` -> `}` is closing try block?
    // 91: `} catch` -> `}` is closing try block?
    // Double closing of try block.
    // Replace `;} \s* \n* \s* } catch` with `; \n } catch`
    content = content.replace(/;\}\s*(\r\n|\n|\r)\s*\} catch/g, ';$1        } catch');

    // Also `finally` block
    // 95: setLoading(false);}
    // 94: } finally {
    // Replace `;} \s* \n* \s* } finally` -> `; \n } finally`
    // Wait, line 94 is `} finally {`. Line 95 ends with `}`.
    // The code structure in `view_file` was:
    // 95: setLoading(false);}
    // 96: 
    // 97: }}}

    // Explicitly remove `}` at end of line 95 if passing into `}}}`
    content = content.replace(/setLoading\(false\);\}/g, 'setLoading(false);');

    // Remove the massive block of `}}}` around line 97.
    // It's likely `loading` state close, `loadData` close, `useEffect` close?
    // The function `loadData` (line 75) needs a closing brace.
    // `setLoading(false);` is inside `finally`.
    // `finally` needs a closing brace.
    // `loadData` needs a closing brace.
    // `useEffect` (line 61) ended at line 64? No line 61 calls `loadData` (wrapper).
    // `loadData` definition started at 75.

    // So around line 97 we need to close `finally`, then close `loadData`.
    // content.replace(/\}\}\}/g, '}}'); // maybe?

    // Let's replace `}}` with `}` globally *if* it follows `;`.
    content = content.replace(/;\}\}/g, ';}');

    // Let's fix the JSX issues.
    // `className="... transition - transform ..."`
    content = content.replace(/transition\s-\stransform/g, 'transition-transform');
    content = content.replace(/duration\s-\s300/g, 'duration-300');
    content = content.replace(/items\s-\scenter/g, 'items-center');
    content = content.replace(/justify\s-\scenter/g, 'justify-center');
    content = content.replace(/rounded\s-\slg/g, 'rounded-lg');
    content = content.replace(/border\s-\s2/g, 'border-2');
    content = content.replace(/border\s-\sblack/g, 'border-black');
    content = content.replace(/border\s-\sgray/g, 'border-gray');
    content = content.replace(/text\s-\sblack/g, 'text-black');
    content = content.replace(/text\s-\swhite/g, 'text-white');
    content = content.replace(/text\s-\sgray/g, 'text-gray');
    content = content.replace(/w\s-\s5/g, 'w-5');
    content = content.replace(/h\s-\s5/g, 'h-5');

    // Fix `({selected.length}}`
    content = content.replace(/\({selected\.length}}/g, '({selected.length})');

    // Fix `<ChevronDown size={14}}`
    content = content.replace(/<ChevronDown size={14}}/g, '<ChevronDown size={14} />');

    // Line 712: `} />` - dangling close from the ChevronDown split?
    // If we fixed the ChevronDown line, we might have a dangling `} />` or similar on next lines.
    // We will just try to write the fixed content.

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed file size:', content.length);

} catch (err) {
    console.error('Error fixing file:', err);
}
