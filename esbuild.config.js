const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

// Load environment variables from .env file
const envResult = dotenv.config();

if (envResult.error) {
    throw envResult.error;
}


const srcDirectory = './src'; // Adjust this to your source directory
const distDirectory = './dist'; // Adjust this to your output directory

function getTsFilesRecursively(directory) {
    const files = fs.readdirSync(directory);
    let tsFiles = [];

    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory()) {
            tsFiles = tsFiles.concat(getTsFilesRecursively(filePath));
        } else if (file.endsWith('.ts')) {
            tsFiles.push(filePath);
        }
    });

    return tsFiles;
}

const tsFiles = getTsFilesRecursively(srcDirectory);

const buildPromises = tsFiles.map(tsFile => {
    const relativePath = path.relative(srcDirectory, tsFile);
    const outputPath = path.join(distDirectory, relativePath.replace('.ts', '.js'));

    return esbuild.build({

        entryPoints: [tsFile], // Your TypeScript entry point
        bundle: true,
        outfile: outputPath, // Output file
        platform: 'node',
        target: 'node16', // Change to your desired Node.js version
        format: 'cjs', // CommonJS module format
        plugins: [nodeExternalsPlugin()], // Exclude node_modules from bundling

        // Add any other options as needed
        tsconfig: './tsconfig.json'
    });
});

Promise.all(buildPromises)
    .catch(() => process.exit(1));
