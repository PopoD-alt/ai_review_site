const fs = require('fs');
const path = require('path');

// Define paths
const toolsPath = path.join(__dirname, 'scraped_data', 'tools.json');
const templatePath = path.join(__dirname, 'template.html');
const distDir = path.join(__dirname, 'dist');
const outputPath = path.join(distDir, 'index.html');

console.log(`Reading tools from: ${toolsPath}`);
console.log(`Reading template from: ${templatePath}`);

try {
    // Read data
    const toolsData = fs.readFileSync(toolsPath, 'utf8');
    const tools = JSON.parse(toolsData);
    const template = fs.readFileSync(templatePath, 'utf8');

    // Generate HTML for tools
    const toolsHtml = tools.map(tool => `
        <div class="tool-card">
            <span class="category">${tool.category || 'Uncategorized'}</span>
            <h2 class="tool-name">${tool.name}</h2>
            <p class="description">${tool.description}</p>
            ${tool.url ? `<a href="${tool.url}" target="_blank" class="visit-btn">Visit Website</a>` : ''}
        </div>
    `).join('');

    // Inject into template
    const finalHtml = template.replace('<!-- TOOLS_PLACEHOLDER -->', toolsHtml);

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
        console.log(`Creating directory: ${distDir}`);
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Write output
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`Successfully wrote index.html to: ${outputPath}`);
    console.log(`Total tools processed: ${tools.length}`);

} catch (error) {
    console.error('Error building site:', error);
    process.exit(1);
}
