#!/usr/bin/env node

 
// SMARTPARK
 

const { exec, spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function colorize(text, color) {
    return `${colors[color] || colors.white}${text}${colors.reset}`;
}

function printSection(title) {
    console.log('\n' + colorize('='.repeat(50), 'cyan'));
    console.log(colorize(`   ${title}`, 'cyan'));
    console.log(colorize('='.repeat(50), 'cyan'));
}

function printSuccess(text) {
    console.log(colorize(`  ${text}`, 'green'));
}

function printWarning(text) {
    console.log(colorize(`  ${text}`, 'yellow'));
}

function printError(text) {
    console.log(colorize(`  ${text}`, 'red'));
}

function printInfo(text) {
    console.log(colorize(`  ${text}`, 'cyan'));
}

function printStep(text) {
    console.log(colorize(`   ${text}`, 'white'));
}

 
// 1. VERIFICAR REQUISITOS DEL SISTEMA
 
function checkCommand(cmd) {
    return new Promise((resolve) => {
        exec(`${cmd} --version`, (error, stdout) => {
            resolve(error ? null : stdout.trim());
        });
    });
}

async function checkRequirements() {
    printSection('  VERIFICANDO REQUISITOS DEL SISTEMA');

    let allOk = true;

    // Node.js
    console.log('\n  Verificando Node.js...');
    const nodeVersion = await checkCommand('node');
    if (nodeVersion) {
        printSuccess(`Node.js ${nodeVersion}`);
    } else {
        printError('  Node.js NO INSTALADO');
        printError('  Descarga desde: https://nodejs.org/');
        allOk = false;
    }

    // npm
    console.log('\n  Verificando npm...');
    const npmVersion = await checkCommand('npm');
    if (npmVersion) {
        printSuccess(`npm ${npmVersion}`);
    } else {
        printError('  npm NO INSTALADO');
        allOk = false;
    }

    // Git (opcional)
    console.log('\n  Verificando Git...');
    const gitVersion = await checkCommand('git');
    if (gitVersion) {
        printSuccess(`Git ${gitVersion}`);
    } else {
        printWarning('Git NO INSTALADO (opcional)');
    }

    return allOk;
}

 
// 2. VERIFICAR DEPENDENCIAS DEL PROYECTO
 
function checkProjectDependencies() {
    printSection('  VERIFICANDO DEPENDENCIAS DEL PROYECTO');

    const results = {
        backend: false,
        frontend: false
    };

    // Backend
    console.log('\n  Backend (backend/)...');
    if (fs.existsSync('./backend/node_modules')) {
        printSuccess('node_modules encontrado');
        results.backend = true;
        if (fs.existsSync('./backend/package-lock.json')) {
            printStep('   package-lock.json encontrado (versiones exactas)');
        }
    } else {
        printWarning('node_modules NO ENCONTRADO');
        printStep('Se instalarán las dependencias');
    }

    // Frontend
    console.log('\nFrontend (mobile-app/)...');
    if (fs.existsSync('./mobile-app/node_modules')) {
        printSuccess('node_modules encontrado');
        results.frontend = true;
        if (fs.existsSync('./mobile-app/package-lock.json')) {
            printStep('   package-lock.json encontrado (versiones exactas)');
        }
    } else {
        printWarning('node_modules NO ENCONTRADO  ');
        printStep('Se instalarán las dependencias');
    }

    return results;
}

// 3. INSTALAR DEPENDENCIAS
function installDependencies(folder, name) {
    return new Promise((resolve) => {
        console.log(`\nInstalando dependencias de ${name}...`);
        console.log(`Usando package.json en ${folder}/`);
        
        const install = spawn('npm', ['install'], {
            cwd: `./${folder}`,
            stdio: 'inherit',
            shell: true
        });

        install.on('close', (code) => {
            if (code === 0) {
                printSuccess(`${name}: dependencias instaladas`);
                resolve(true);
            } else {
                printError(`Error al instalar ${name}`);
                resolve(false);
            }
        });
    });
}


// 4. PREGUNTAR AL USUARIO
function askUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toUpperCase());
        });
    });
}

 
// 5. FUNCIÓN PRINCIPAL
async function main() {
    console.clear();
    printSection(' SMARTPARK - INSTALADOR');

    // 1. Verificar requisitos del sistema
    const requirementsOk = await checkRequirements();
    if (!requirementsOk) {
        console.log('\n  Faltan requisitos para ejecutar el sistema');
        console.log('  Instala Node.js desde: https://nodejs.org/');
        process.exit(1);
    }

    // 2. Verificar dependencias del proyecto
    const { backend, frontend } = checkProjectDependencies();

    // 3. Preguntar si instalar
    if (!backend || !frontend) {
        console.log('\n  Faltan dependencias por instalar');
        const answer = await askUser('¿Deseas instalarlas ahora? (S/N): ');
        
        if (answer !== 'S') {
            console.log('\n  Instalación cancelada');
            console.log('  Ejecuta manualmente:');
            console.log('   cd backend && npm install');
            console.log('   cd mobile-app && npm install');
            process.exit(0);
        }

        // Instalar backend
        if (!backend) {
            const ok = await installDependencies('backend', 'Backend');
            if (!ok) process.exit(1);
        }

        // Instalar frontend
        if (!frontend) {
            const ok = await installDependencies('mobile-app', 'Frontend');
            if (!ok) process.exit(1);
        }
    } else {
        printSuccess('\n  Todas las dependencias están instaladas');
    }

    // 4. Resumen final
    printSection('  INSTALACIÓN COMPLETA');

    console.log('\n  Estado:');
    console.log(`   Node.js: ${await checkCommand('node')}`);
    console.log(`   npm: ${await checkCommand('npm')}`);
    console.log(`   Backend: ${fs.existsSync('./backend/node_modules') ? 'Instalado  ' : 'Pendiente  '}`);
    console.log(`   Frontend: ${fs.existsSync('./mobile-app/node_modules') ? 'Instalado  ' : 'Pendiente  '}`);
    console.log(`   MySQL: Usando XAMPP (configurado en db.js)`);

    console.log('\n Comandos para iniciar:');
    console.log(colorize('   Terminal 1 (Backend):', 'yellow'));
    console.log('   cd backend && node server.js');
    console.log(colorize('   Terminal 2 (Frontend):', 'yellow'));
    console.log('   cd mobile-app && npx expo start -c');

    console.log('\n Credenciales de prueba:');
    console.log(`   Admin: admin@smartpark.com / admin123`);
    console.log(`   Empleado: empleado@smartpark.com / empleado123`);
}

 
// EJECUTAR
 
main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});