const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// Find the main <style> block
const styleStartRegex = /<style>/;
const styleEndRegex = /<\/style>/;

const startStyleMatch = content.match(styleStartRegex);
const endStyleMatch = content.match(styleEndRegex);

if (startStyleMatch && endStyleMatch) {
    const styleStart = startStyleMatch.index + '<style>'.length;
    const styleEnd = endStyleMatch.index;
    const styles = content.substring(styleStart, styleEnd);
    fs.writeFileSync('styles.css', styles.trim() + '\n');
    console.log('Created styles.css');
}

// Find the main module script block
const scriptStartRegex = /<script type="module">/;
const scriptEndRegex = /<\/script>\s*<!-- DATA QUALITY REVIEW MODAL -->/g;

let moduleScriptStart = -1;
let moduleScriptEnd = -1;

const scriptStartMatch = content.match(scriptStartRegex);
if (scriptStartMatch) {
    moduleScriptStart = scriptStartMatch.index + '<script type="module">'.length;
}

// The script block is very large, so we need to find the ending </script> tag
// that appears before the "<!-- DATA QUALITY REVIEW MODAL -->" comment.
const parts = content.split('<!-- DATA QUALITY REVIEW MODAL -->');
if (parts.length > 1) {
    const firstPart = parts[0];
    const lastScriptEndIndex = firstPart.lastIndexOf('</script>');
    if (lastScriptEndIndex !== -1 && moduleScriptStart !== -1) {
        const scriptContent = firstPart.substring(moduleScriptStart, lastScriptEndIndex);
        fs.writeFileSync('app.js', scriptContent.trim() + '\n');
        console.log('Created app.js');
    } else {
        console.log('Could not find the end of the module script block.');
    }
} else {
    console.log('Could not find <!-- DATA QUALITY REVIEW MODAL -->');
}

// Write the new index.html with external links
if (fs.existsSync('styles.css') && fs.existsSync('app.js')) {
    let newHtml = content.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="styles.css">');

    // We need to carefully replace the large script block
    const firstPart = newHtml.split('<!-- DATA QUALITY REVIEW MODAL -->')[0];
    const lastScriptEndIndex = firstPart.lastIndexOf('</script>');
    const scriptStartMatchNew = newHtml.match(/<script type="module">/);

    if (scriptStartMatchNew && lastScriptEndIndex !== -1) {
        const beforeScript = newHtml.substring(0, scriptStartMatchNew.index);
        const afterScript = newHtml.substring(lastScriptEndIndex + '</script>'.length);
        newHtml = beforeScript + '<script type="module" src="app.js"></script>\n    ' + afterScript;
        fs.writeFileSync('index.html', newHtml);
        console.log('Updated index.html');
    }
}
