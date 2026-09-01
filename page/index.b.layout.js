import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../config/device.js";

export const centered_x = DEVICE_WIDTH/2
export const centered_y = DEVICE_HEIGHT/2


export const FETCH_RESULT_TEXT = {
  x: centered_x-px(227),
  y: centered_y-100,
  w: px(454),
  h: px(200),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};


export const TASK_BUTTON = {
  x: centered_x-px(100),
  y: px(0), // Placeholder. Handled in index.js
  w: px(200),
  h: px(70),
  normal_color: 0x212427, // Placeholder. Handled in index.js
  press_color: 0x222428, // Placeholder. Handled in index.js 
  radius: 10,
  text_size: 20
}

export const BANNER = {
  normal_src: "image/banner.png",
  press_src: "image/banner.png",
  x: centered_x - px(88),
  y: px(80),
  w: -1,
  h: -1,
  auto_scale: true,
  click_func: () => hmUI.showToast({text: "Unoficcial app created by Yellow_Cat. Use at your own risk. Hold to refresh."})
}

export const VALUES = [0x3bcad7, 0x39c9d8, 0x23cc8f, 0xfcbf5d, 0xff9450, 0xff6066] // Bright Blue 	Greater than 10 	12 positive, Light Blue 	Between 5 and 10 	6 positive, Green 	Between 1 and 5 	1 positive, Yellow 	Between -1 and 1 	0 clicks, Orange 	Between -10 and -1 	1 negative, Red 	Between -20 and -10 	9 negative, Dark Red 	Less than -20 	16 negative 
export const DARK_VALUES = [0x2f99ab, 0x2d98aa, 0x1d996c, 0xc9954a, 0xcc733d, 0xcc484d] // 20% Darker for when pressing
