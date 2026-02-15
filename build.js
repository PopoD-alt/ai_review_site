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
    let template = fs.readFileSync(templatePath, 'utf8');

    // 1. Generate Tool Cards HTML with Tailwind classes
    const toolsHtml = tools.map(tool => {
        const category = tool.category || 'Uncategorized';
        // Generate a random "likes" number for visual appeal
        const likes = Math.floor(Math.random() * 500) + 50; 
        
        return `
        <div class="tool-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 p-6 flex flex-col justify-between" 
             data-name="${tool.name}" data-category="${category}" data-desc="${tool.description}">
            
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        ${tool.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 leading-tight">${tool.name}</h3>
                        <span class="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">${category}</span>
                    </div>
                </div>
                <div class="flex items-center text-gray-400 text-xs space-x-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                    <span>${likes}</span>
                </div>
            </div>

            <p class="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                ${tool.description}
            </p>

            <div class="mt-auto">
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer" 
                   class="block w-full text-center bg-gray-900 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200">
                    Visit Website
                </a>
            </div>
        </div>
        `;
    }).join('');

    // 2. Generate Category Filter Buttons
    const uniqueCategories = [...new Set(tools.map(t => t.category || 'Uncategorized'))].sort();
    const categoriesHtml = uniqueCategories.map(cat => `
        <button class="category-filter px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 transition shadow-sm" 
                onclick="filterCategory('${cat}')" data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    // 3. Inject into template
    let finalHtml = template.replace('<!-- TOOLS_PLACEHOLDER -->', toolsHtml);
    finalHtml = finalHtml.replace('<!-- CATEGORIES_PLACEHOLDER -->', categoriesHtml);

    // 4. Inject script logic for filtering
    const scriptLogic = `
    <script>
        function filterCategory(category) {
            const cards = document.querySelectorAll('.tool-card');
            const buttons = document.querySelectorAll('.category-filter');
            
            // Highlight active button
            buttons.forEach(btn => {
                // Check if button text matches category, or if it's the "All" button
                const btnCat = btn.getAttribute('data-category');
                const isAll = (category === 'all' && btn.innerText.trim() === 'All');
                
                if (btnCat === category || isAll) {
                    btn.classList.add('bg-indigo-600', 'text-white', 'border-transparent');
                    btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
                } else {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'border-transparent');
                    btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
                }
            });

            cards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (category === 'all' || cardCat === category) {
                    card.style.display = 'flex'; // Restore flex for layout
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.tool-card');
            
            cards.forEach(card => {
                const name = card.getAttribute('data-name').toLowerCase();
                const desc = card.getAttribute('data-desc').toLowerCase();
                
                if (name.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    </script>
    `;
    
    // Append script before body close
    finalHtml = finalHtml.replace('</body>', `${scriptLogic}</body>`);

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
