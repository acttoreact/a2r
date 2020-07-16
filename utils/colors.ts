import chalk from 'chalk';
import { out } from '@a2r/telemetry';

/**
 * Framework logo for terminal
 */
export const logo = chalk.magenta.bold(`
                  :ooooooooooooooooooooo:\`               \`.:++++++++++++++++++++++++++//:-.\`        
                -ooooooooooooooooooo/.                      -/ooooooooooooooooooooooooooooo+:.      
               .ooooooooooooooooooo\`                          .+oooooooooooooooooooooooooooooo+-    
              \`oooooooooooooooooooo/                           \`+ooooooooooooooooooooooooooooooo+\`  
             \`+ooooooooooooooooooooo/     ${chalk.yellow('`.-:///:-`-/-')}         \`ooooooooooooooooooooooooooooooooo\` 
             +oooooooooooooooooo+////\`  ${chalk.yellow('`-/oooooooooo+.`')}          :ooooooooooo:.....-:+oooooooooooo:
            /ooooooooooooooo/-.\`\`....${chalk.yellow('-+ooooo+-.-oooo+')}            .ooooooooooo-        :oooooooooooo 
           :ooooooooooooooo+ ${chalk.yellow('`/+oooooooooooo-   /ooo:')}            -ooooooooooo-         oooooooooooo 
          -ooooooooooooooooo\` ${chalk.yellow('-/ooooooooooooo+/+ooo/')}             /ooooooooooo-        .ooooooooooo+ 
         -ooooooooooooooooooo:  ${chalk.yellow('+oooooooooooooooo+-')}             .oooooooooooo-    \`\`.:oooooooooooo- 
        .oooooooooooooooooooo. ${chalk.yellow(':ooooooooooooooo+-`')}             \`+ooooooooooooo+++++oooooooooooooo:  
       \`ooooooooooooooooooooo\`${chalk.yellow('`.ooooooooooooo:.')}               -oooooooooooooooooooooooooooooooo+-   
      \`+oooooooooooooooooooo${chalk.yellow('--o:`/oooooooooo-')}               \`/ooooooooooooooooooooooooooooooo+-\`    
      /oooooooooooooooo/..${chalk.yellow('-o/.//- .-...oooo:')}              \`/oooooooooooooooooooooooooooooo+-\`       
     /ooooooooooooooooo:\`  ${chalk.yellow('`+o//++///- -++-')}            \`-/ooooooooooooooooooooooooooooooooo-        
    :ooooooooooooooooo:${chalk.yellow('`....+')}ooooooooo:.\`\`.         \`-/ooooooooooooooooooooooooooooooooooooo/\`      
   -ooooooooooooooooooooooooooooooooooooooo/      ./ooooooooooooooooooooooooooooooooooooooooo+.     
  .oooooooooooo................-oooooooooooo:    .---------------:ooooooooooo:..../oooooooooooo:    
 \`oooooooooooo-                 -oooooooooooo-                   .ooooooooooo-     -oooooooooooo+\`  
\`+ooooooooooo:                   :oooooooooooo.                  .ooooooooooo-      .ooooooooooooo- 
+ooooooooooo/                     /oooooooooooo\`                 .ooooooooooo-       \`+oooooooooooo/`);

/**
 * Styled framework name
 */
export const framework = chalk.magenta('A2R Framework');

/**
 * Logs with styled text
 * @param message Message to log
 */
export const log = (message: string): void => {
  out.info(chalk.yellow.bold(message));
};

/**
 * Logs styled version number
 * @param versionNumber Version number
 */
export const version = (versionNumber: string): string => `v${chalk.green(versionNumber)}`;

/**
 * Logs styled full path
 * @param path Path
 */
export const fullPath = (path: string): string => chalk.cyan(path);

/**
 * Logs styled file name
 * @param name File name
 */
export const fileName = (name: string): string => chalk.cyan.bold(name);

/**
 * Logs styled terminal command
 * @param command Terminal command
 */
export const terminalCommand = (command: string): string => chalk.whiteBright(command);
