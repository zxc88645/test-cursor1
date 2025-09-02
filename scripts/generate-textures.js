import fs from 'fs';
import path from 'path';

// 創建目錄結構
const dirs = [
    'public/textures/ground',
    'public/textures/blocks', 
    'public/textures/player',
    'public/textures/bomb',
    'public/textures/fire',
    'public/textures/walls',
    'public/textures/particles'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 生成SVG紋理（可以轉換為PNG/JPG）
const generateSVGTexture = (name, width, height, content) => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${content}
</svg>`;
    
    fs.writeFileSync(`public/textures/${name}.svg`, svg);
    console.log(`✅ 已生成 ${name}.svg`);
};

// 生成地面紋理
generateSVGTexture('ground/base', 512, 512, `
    <defs>
        <pattern id="ground" patternUnits="userSpaceOnUse" width="64" height="64">
            <rect width="64" height="64" fill="#8B7355"/>
            <circle cx="16" cy="16" r="2" fill="#6B4423"/>
            <circle cx="48" cy="48" r="1" fill="#6B4423"/>
            <circle cx="32" cy="32" r="1.5" fill="#6B4423"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#ground)"/>
`);

generateSVGTexture('ground/grass', 512, 512, `
    <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="32" height="32">
            <rect width="32" height="32" fill="#228B22"/>
            <line x1="0" y1="0" x2="32" y2="32" stroke="#32CD32" stroke-width="1"/>
            <line x1="32" y1="0" x2="0" y2="32" stroke="#32CD32" stroke-width="1"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#grass)"/>
`);

generateSVGTexture('ground/concrete', 512, 512, `
    <defs>
        <pattern id="concrete" patternUnits="userSpaceOnUse" width="128" height="128">
            <rect width="128" height="128" fill="#C0C0C0"/>
            <rect x="0" y="0" width="128" height="4" fill="#A0A0A0"/>
            <rect x="0" y="124" width="128" height="4" fill="#A0A0A0"/>
            <rect x="0" y="0" width="4" height="128" fill="#A0A0A0"/>
            <rect x="124" y="0" width="4" height="128" fill="#A0A0A0"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#concrete)"/>
`);

// 生成方塊紋理
generateSVGTexture('blocks/stone', 512, 512, `
    <defs>
        <pattern id="stone" patternUnits="userSpaceOnUse" width="64" height="64">
            <rect width="64" height="64" fill="#696969"/>
            <polygon points="0,0 32,16 64,0 64,64 32,48 0,64" fill="#808080"/>
            <circle cx="16" cy="16" r="4" fill="#A0A0A0"/>
            <circle cx="48" cy="48" r="3" fill="#A0A0A0"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#stone)"/>
`);

generateSVGTexture('blocks/metal', 512, 512, `
    <defs>
        <pattern id="metal" patternUnits="userSpaceOnUse" width="128" height="128">
            <rect width="128" height="128" fill="#708090"/>
            <rect x="0" y="0" width="128" height="2" fill="#FFFFFF"/>
            <rect x="0" y="126" width="128" height="2" fill="#000000"/>
            <rect x="0" y="0" width="2" height="128" fill="#FFFFFF"/>
            <rect x="126" y="0" width="2" height="128" fill="#000000"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#metal)"/>
`);

// 生成玩家紋理
generateSVGTexture('player/player', 512, 512, `
    <defs>
        <pattern id="player" patternUnits="userSpaceOnUse" width="256" height="256">
            <circle cx="128" cy="128" r="80" fill="#4169E1"/>
            <circle cx="128" cy="128" r="60" fill="#1E90FF"/>
            <rect x="108" y="148" width="40" height="60" fill="#4169E1"/>
            <rect x="118" y="208" width="20" height="40" fill="#000080"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#player)"/>
`);

// 生成炸彈紋理
generateSVGTexture('bomb/bomb', 512, 512, `
    <defs>
        <pattern id="bomb" patternUnits="userSpaceOnUse" width="256" height="256">
            <circle cx="128" cy="128" r="100" fill="#2F2F2F"/>
            <circle cx="128" cy="128" r="80" fill="#000000"/>
            <rect x="118" y="28" width="20" height="40" fill="#8B4513"/>
            <circle cx="128" cy="48" r="8" fill="#FF4500"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#bomb)"/>
`);

// 生成火焰紋理
generateSVGTexture('fire/fire', 512, 512, `
    <defs>
        <pattern id="fire" patternUnits="userSpaceOnUse" width="256" height="256">
            <defs>
                <radialGradient id="fireGrad">
                    <stop offset="0%" stop-color="#FFFF00"/>
                    <stop offset="50%" stop-color="#FF4500"/>
                    <stop offset="100%" stop-color="#8B0000"/>
                </radialGradient>
            </defs>
            <ellipse cx="128" cy="128" rx="100" ry="150" fill="url(#fireGrad)"/>
            <ellipse cx="128" cy="128" rx="60" ry="90" fill="#FFFF00"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#fire)"/>
`);

// 生成牆壁紋理
generateSVGTexture('walls/wall', 512, 512, `
    <defs>
        <pattern id="wall" patternUnits="userSpaceOnUse" width="128" height="128">
            <rect width="128" height="128" fill="#8B7355"/>
            <rect x="0" y="0" width="128" height="8" fill="#A0522D"/>
            <rect x="0" y="120" width="128" height="8" fill="#A0522D"/>
            <rect x="0" y="0" width="8" height="128" fill="#A0522D"/>
            <rect x="120" y="0" width="8" height="128" fill="#A0522D"/>
            <rect x="64" y="0" width="8" height="128" fill="#A0522D"/>
            <rect x="0" y="64" width="128" height="8" fill="#A0522D"/>
        </pattern>
    </defs>
    <rect width="512" height="512" fill="url(#wall)"/>
`);

// 生成粒子紋理
generateSVGTexture('particles/spark', 128, 128, `
    <defs>
        <radialGradient id="sparkGrad">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#FFFF00"/>
        </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="32" fill="url(#sparkGrad)"/>
    <circle cx="64" cy="64" r="16" fill="#FFFFFF"/>
`);

generateSVGTexture('particles/smoke', 128, 128, `
    <defs>
        <pattern id="smoke" patternUnits="userSpaceOnUse" width="128" height="128">
            <defs>
                <radialGradient id="smokeGrad">
                    <stop offset="0%" stop-color="#FFFFFF"/>
                    <stop offset="50%" stop-color="#C0C0C0"/>
                    <stop offset="100%" stop-color="#808080"/>
                </radialGradient>
            </defs>
            <ellipse cx="64" cy="64" rx="48" ry="32" fill="url(#smokeGrad)"/>
        </pattern>
    </defs>
    <rect width="128" height="128" fill="url(#smoke)"/>
`);

generateSVGTexture('particles/explosion', 256, 256, `
    <defs>
        <radialGradient id="explosionGrad">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="30%" stop-color="#FFFF00"/>
            <stop offset="60%" stop-color="#FF4500"/>
            <stop offset="100%" stop-color="#8B0000"/>
        </radialGradient>
    </defs>
    <circle cx="128" cy="128" r="120" fill="url(#explosionGrad)"/>
    <circle cx="128" cy="128" r="80" fill="#FFFF00"/>
`);

console.log('\n🎨 所有程序化紋理已生成完成！');
console.log('📁 文件位置: public/textures/');
console.log('💡 提示: 這些SVG文件可以直接在瀏覽器中使用，也可以轉換為PNG/JPG格式');
console.log('🚀 現在您可以運行遊戲來查看紋理效果了！');
