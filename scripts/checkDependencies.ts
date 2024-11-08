import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const checkSwiftDependencies = () => {
  const iosPath = path.join(__dirname, '..', 'ios');
  const podsPath = path.join(iosPath, 'Pods');
  
  if (!fs.existsSync(podsPath)) {
    console.error('Pods directory not found. Run pod install first.');
    process.exit(1);
  }

  try {
    const result = execSync('cd ios && xcodebuild -list -json', { encoding: 'utf8' });
    const projectInfo = JSON.parse(result);
    
    const hasSwiftLibraries = projectInfo.project.targets.some((target: string) => {
      const frameworkPath = path.join(podsPath, target);
      if (fs.existsSync(frameworkPath)) {
        const files = fs.readdirSync(frameworkPath);
        return files.some(file => file.endsWith('.swift'));
      }
      return false;
    });

    console.log('Swift dependencies check complete:');
    console.log(`Swift support required: ${hasSwiftLibraries}`);
    
    if (hasSwiftLibraries) {
      console.log('\nSwift-dependent packages found:');
      projectInfo.project.targets.forEach((target: string) => {
        const frameworkPath = path.join(podsPath, target);
        if (fs.existsSync(frameworkPath)) {
          const files = fs.readdirSync(frameworkPath);
          if (files.some(file => file.endsWith('.swift'))) {
            console.log(`- ${target}`);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error checking Swift dependencies:', error);
    process.exit(1);
  }
};

checkSwiftDependencies();
