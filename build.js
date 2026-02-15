const fs = require('fs');
const path = require('path');

// Define paths
const dataDir = path.join(__dirname, 'scraped_data');
const toolsPath = path.join(dataDir, 'tools.json');
const newsPath = path.join(dataDir, 'news.json');
const llmsPath = path.join(dataDir, 'llms.json');
const templatePath = path.join(__dirname, 'template.html');
const distDir = path.join(__dirname, 'dist');
const outputPath = path.join(distDir, 'index.html');

console.log(`Building site...`);

try {
    // Read data
    const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
    const template = fs.readFileSync(templatePath, 'utf8');

    // Handle missing files gracefully
    let news = [];
    try { news = JSON.parse(fs.readFileSync(newsPath, 'utf8')); } catch (e) { console.warn('news.json not found, using empty array'); }

    let llms = [];
    try { llms = JSON.parse(fs.readFileSync(llmsPath, 'utf8')); } catch (e) { console.warn('llms.json not found, using empty array'); }

    // 1. Generate Tool Cards
    const toolsHtml = tools.map(tool => {
        const category = tool.category || 'Uncategorized';
        const likes = Math.floor(Math.random() * 500) + 50; 
        
        return `
        <div class="tool-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 p-6 flex flex-col justify-between h-full" 
             data-name="${tool.name}" data-category="${category}" data-desc="${tool.description}">
            
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                        ${tool.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 leading-tight">${tool.name}</h3>
                        <span class="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">${category}</span>
                    </div>
                </div>
                <div class="flex items-center text-gray-400 text-xs space-x-1 flex-shrink-0">
                    <span>❤️ ${likes}</span>
                </div>
            </div>

            <p class="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                ${tool.description}
            </p>

            <div class="mt-auto pt-4 border-t border-gray-100">
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer" 
                   class="block w-full text-center bg-gray-900 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 text-sm">
                    Visit Website
                </a>
            </div>
        </div>
        `;
    }).join('');

    // 2. Generate News Cards
    const newsHtml = news.map(item => `
        <a href="${item.url}" target="_blank" class="block group">
            <div class="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r-lg">
                <h4 class="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">${item.title}</h4>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">${item.summary}</p>
                <span class="text-xs text-gray-400 mt-2 block">${item.date}</span>
            </div>
        </a>
    `).join('');

    // 3. Generate LLM Leaderboard Cards
    const llmHtml = llms.map((model, index) => {
        const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        return `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-900">${rankEmoji} ${model.name}</h4>
                <span class="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">${model.performance}</span>
            </div>
            <p class="text-xs text-gray-500 mb-2">by ${model.provider} • ${model.context} Context</p>
            <p class="text-sm text-gray-700 mb-3">${model.description}</p>
            <div class="flex justify-between items-center text-xs">
                <span class="font-mono bg-gray-200 px-1 rounded">${model.price}</span>
                <a href="${model.url}" target="_blank" class="text-indigo-600 hover:underline">Try it →</a>
            </div>
        </div>
        `;
    }).join('');

    // 4. Generate Categories HTML
    const uniqueCategories = [...new Set(tools.map(t => t.category || 'Uncategorized'))].sort();
    const categoriesHtml = uniqueCategories.map(cat => `
        <button class="category-filter px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-indigo-300 transition shadow-sm" 
                onclick="filterCategory('${cat}')" data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    // 5. Inject into template
    let finalHtml = template
        .replace('<!-- TOOLS_PLACEHOLDER -->', toolsHtml)
        .replace('<!-- NEWS_PLACEHOLDER -->', newsHtml || '<p class="text-gray-500 text-sm italic">No news available today.</p>')
        .replace('<!-- LLM_PLACEHOLDER -->', llmHtml || '<p class="text-gray-500 text-sm italic">Leaderboard updating...</p>')
        .replace('<!-- CATEGORIES_PLACEHOLDER -->', categoriesHtml);

    // 6. Inject JS Logic
    const scriptLogic = `
    <script>
        function filterCategory(category) {
            const cards = document.querySelectorAll('.tool-card');
            const buttons = document.querySelectorAll('.category-filter');
            
            buttons.forEach(btn => {
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
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
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
    
    finalHtml = finalHtml.replace('</body>', `${scriptLogic}</body>`);

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, finalHtml);
    console.log(`Successfully wrote index.html to: ${outputPath}`);

} catch (error) {
    console.error('Error building site:', error);
    process.exit(1);
}
