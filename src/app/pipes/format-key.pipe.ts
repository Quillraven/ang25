import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStatsKey',
  standalone: true
})
export class FormatStatsKeyPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remove 'base' prefix if present
    let result = value;
    if (result.toLowerCase().startsWith('base')) {
      result = result.substring(4); // Remove the first 4 characters ('base')
    }

    // Capitalize the first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Add a space before any other uppercase letter
    result = result.replace(/([A-Z])/g, ' $1').trim();

    return result;
  }
}
