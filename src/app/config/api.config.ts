import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const API_CONFIG = {
  baseUrl: 'https://raw.githubusercontent.com/Quillraven/Masamune/refs/heads/master/'
};
