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
        <div class="tool-card glass rounded-3xl overflow-hidden p-6 flex flex-col justify-between h-full group" 
             data-name="${tool.name}" data-category="${category}" data-desc="${tool.description}">
            
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-4">
                    <div class="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        ${tool.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white leading-tight">${tool.name}</h3>
                        <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">${category}</span>
                    </div>
                </div>
                <div class="flex items-center text-gray-500 text-xs font-bold space-x-1 flex-shrink-0">
                    <span class="text-pink-500">✦</span> <span>${likes}</span>
                </div>
            </div>

            <p class="text-gray-400 text-sm mb-8 flex-grow leading-relaxed font-medium">
                ${tool.description}
            </p>

            <div class="mt-auto">
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer" 
                   class="flex items-center justify-center w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all duration-300 text-sm border border-white/5 hover:border-white/10 group-hover:shadow-lg group-hover:shadow-white/5">
                    Launch Tool
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </div>
        `;
    }).join('');

    // 2. Generate News Cards
    const newsHtml = news.map(item => `
        <a href="${item.url}" target="_blank" class="block group">
            <div class="relative pl-6 py-1">
                <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-white/5 group-hover:bg-indigo-500 transition-colors"></div>
                <h4 class="font-bold text-gray-200 group-hover:text-white transition-colors text-sm leading-snug">${item.title}</h4>
                <p class="text-xs text-gray-500 mt-2 line-clamp-2 font-medium">${item.summary}</p>
                <div class="flex items-center mt-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    <span>${item.date}</span>
                </div>
            </div>
        </a>
    `).join('');

    // 3. Generate LLM Leaderboard Cards
    const llmHtml = llms.map((model, index) => {
        const rankColors = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-gray-500';
        return `
        <div class="relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-white flex items-center text-sm">
                    <span class="mr-2 ${rankColors} font-black">0${index + 1}</span> 
                    ${model.name}
                </h4>
                <span class="text-[10px] font-black px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/10 uppercase tracking-tighter">${model.performance}</span>
            </div>
            <p class="text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-wider">by ${model.provider} • ${model.context} ctx</p>
            <p class="text-xs text-gray-400 mb-4 font-medium leading-relaxed">${model.description}</p>
            <div class="flex justify-between items-center text-[10px]">
                <span class="font-black text-white bg-white/10 px-2 py-1 rounded-md uppercase tracking-widest">${model.price}</span>
                <a href="${model.url}" target="_blank" class="text-indigo-400 hover:text-indigo-300 font-black flex items-center uppercase tracking-widest">
                    Access 
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </div>
        `;
    }).join('');

    // 4. Generate Categories HTML
    const uniqueCategories = [...new Set(tools.map(t => t.category || 'Uncategorized'))].sort();
    const categoriesHtml = uniqueCategories.map(cat => `
        <button class="category-filter px-6 py-2 rounded-full text-xs font-bold text-gray-400 border border-white/5 hover:border-white/20 hover:text-white transition-all backdrop-blur-sm" 
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
                const isAll = (category === 'all' && btn.innerText.trim() === 'All Universe');
                
                if (btnCat === category || isAll) {
                    btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-400/20');
                    btn.classList.remove('text-gray-400', 'border-white/5');
                } else {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-400/20');
                    btn.classList.add('text-gray-400', 'border-white/5');
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
