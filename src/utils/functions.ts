import type { Category, Variant, VariantCombination } from './types';

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;
const VITE_FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;

export const beautifyError = (error: any) => {
  // console.log('Error:', error);

  let message = 'Something went wrong!';

  if (!error) {
    message = 'Something went wrong!';
  } else if (typeof error === 'string') {
    message = error;
  } else if (error.message) {
    message = error.message;
  } else if (error.error && Array.isArray(error.error) && error.error.length > 0) {
    message = error.error[0].path[0] + ': ' + error.error[0].message;
  }

  return message;
};

export function formatDateWithTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateFromMilliSecond(ml: string | number) {
  const date = new Date(ml);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function cartesian(arr: Variant[]): VariantCombination[] {
  return arr.reduce<VariantCombination[]>(
    (acc, cur) => {
      const res: VariantCombination[] = [];
      acc.forEach((a) => {
        cur.values.forEach((v) => {
          res.push({ ...a, [cur.name]: v });
        });
      });
      return res;
    },
    [{}]
  );
}

export const replaceSpaces = (s: string | undefined) => {
  if (!s) {
    return '';
  }
  return s.replace(/\s+/g, '-');
};

export const replaceDashes = (s: string | undefined) => {
  if (!s) {
    return '';
  }
  return s.replace(/-+/g, ' ');
};

export const cropText = (s: string | undefined, length: number) => {
  if (!s) {
    return '';
  }

  if (s.length <= length) {
    return s;
  }

  return s.slice(0, length) + '...';
};

export const fixWhatsappNumber = (number: string | undefined): string => {
  const clean = number?.trim();

  if (!clean) return 'N/A';

  if (clean.startsWith('+880')) return clean;
  if (clean.startsWith('880')) return '+' + clean;
  if (clean.startsWith('0')) return '+88' + clean;

  // fallback: assume it’s missing country code
  return '+880' + clean;
};

export const getUploadedUrl = (url: string) => {
  if (!url) {
    return '/img/product-image.png';
  }

  return VITE_FILE_BASE_URL + url;
};

export const copyToClipboard = async (value: string) => {
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

export const getCategoryChilds = (categories: Category[], parentId: number): Category[] => {
  if (!categories) {
    return [];
  }
  return categories
    .filter((category) => category.parentId === parentId)
    .map((item) => ({ ...item, childs: getCategoryChilds(categories, item.id) }))
    .sort((a, b) => {
      if (!a.order || !b.order) {
        return Infinity;
      }
      return a.order - b.order;
    });
};

export const beautifyVariation = (variation: string) => {
  return variation.replace(/__/g, ', ');
};

export const printHTML = (html: string, orientation = 'portrait') => {
  let styleElement = document.getElementById('dynamic-print-style');

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'dynamic-print-style';
    document.head.appendChild(styleElement);
  }

  let printCSS = `
    .print-el {
        display: none !important;
    }
    @media print {
        @page {
            size: A4 ${orientation};
            margin: ${orientation === 'landscape' ? '0.15in' : '0.3in'};
        }
        .print:hidden {
            display: none !important;
        }
        .print-el {
            display: block !important;
        }
    }`;
  styleElement.innerHTML = printCSS;

  const appEl = document.getElementById('app');
  const printEl = document.createElement('div');
  printEl.classList.add('print-el');
  document.body.appendChild(printEl);

  appEl!.style.display = 'none';
  printEl.innerHTML = html;

  // Handle before and after print events
  const cleanup = () => {
    // return;
    printEl.remove();
    appEl!.style.display = '';
    window.onafterprint = null;
    window.onbeforeprint = null;
  };

  window.onbeforeprint = () => {
    // Optional: things to do just before print starts
    console.log('Printing started');
  };

  window.onafterprint = () => {
    console.log('Printing completed or cancelled');
    cleanup();
  };

  // Some browsers won't trigger these events properly,
  // so we add a fallback timeout.

  setTimeout(() => {
    window.print();
  }, 555);

  // Fallback in case onafterprint doesn't fire
  setTimeout(() => {
    cleanup();
  }, 2000);
};
