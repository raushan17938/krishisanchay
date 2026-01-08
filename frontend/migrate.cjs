const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, fileList);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const files = walk('./src');

files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    const isTsx = ext === '.tsx';

    try {
        const result = esbuild.transformSync(content, {
            loader: isTsx ? 'tsx' : 'ts',
            jsx: 'preserve',
            target: 'esnext',
            format: 'esm'
        });

        const newFilePath = filePath.replace(/\.tsx?$/, isTsx ? '.jsx' : '.js');
        fs.writeFileSync(newFilePath, result.code);
        fs.unlinkSync(filePath); // Delete original
        console.log(`Converted: ${filePath} -> ${newFilePath}`);
    } catch (err) {
        console.error(`Error converting ${filePath}:`, err);
    }
});
