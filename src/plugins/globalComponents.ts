import { type App } from 'vue';
import { NButton } from 'naive-ui';
import SmartLink from '@/components/others/SmartLink.vue';

const myPlugin = {
  install(app: App, options?: any) {
    // Add global components
    app.component('NButton', NButton);
    app.component('SmartLink', SmartLink);
    // app.component('NIcon', NIcon);
    // app.component('NModal', NModal);
    // custom components
    // app.component('AForm', AForm);
    // app.component('AFormInput', AFormInput);
    // app.component('AFormSelect', AFormSelect);
    // Example: add global property (optional)
    // app.config.globalProperties.$myPlugin = (msg: string) => {
    //   console.log(`Plugin Message: ${msg}`);
    // };
    // Example: add global directive (optional)
    // app.directive('focus', {
    //   mounted(el: HTMLElement) {
    //     el.focus();
    //   },
    // });
  }
};

declare module 'vue' {
  export interface GlobalComponents {
    NButton: typeof NButton;
    SmartLink: typeof SmartLink;
  }
}

export default myPlugin;
