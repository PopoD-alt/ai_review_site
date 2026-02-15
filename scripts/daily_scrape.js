const fs = require('fs');
const path = require('path');

// Simulate scraping new AI tools (replace with actual scraper if API available)
const toolsPath = path.join(__dirname, '../scraped_data/tools.json');
const categories = ["Productivity", "Design", "Marketing", "Video", "Writing", "Code"];

function getRandomTool() {
    const names = ["NovaFlow", "Synthetix", "BrainWave", "PixelMinds", "CopyGenius", "CodePilot"];
    const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    return {
        name: name,
        description: `Automated discovery: This AI tool helps with ${category.toLowerCase()} tasks efficiently.`,
        category: category,
        url: `https://example.com/${name.toLowerCase()}`,
        date_added: new Date().toISOString().split('T')[0]
    };
}

try {
    let tools = [];
    if (fs.existsSync(toolsPath)) {
        tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
    }

    // Simulate finding 1 new tool per day
    const newTool = getRandomTool();
    console.log(`Found new tool: ${newTool.name}`);

    // Add to top of list
    tools.unshift(newTool);

    // Keep list reasonable size (optional)
    if (tools.length > 50) tools.pop();

    fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
    console.log('Updated tools.json successfully.');

} catch (error) {
    console.error('Error in daily scrape:', error);
    process.exit(1);
}
