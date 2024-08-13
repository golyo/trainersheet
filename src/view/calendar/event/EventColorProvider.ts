interface ColorProviderType {
  getColorAt: (i: number) => string
}

/**
 * Color provider using HSL Colors described in https://www.w3schools.com/colors/colors_hsl.asp
 * @param colorNo: The color number to use
 * @constructor
 */
const EventColorProvider: (colorNo: number, s?: number, l?: number) => ColorProviderType = (colorNo: number, s = 70, l = 40) => ({
  /**
   * Return the color at any natural number
   * @param i Natural number
   */
  getColorAt: (i: number) => `hsl(${Math.floor(360 / colorNo * (i % colorNo))}deg, ${s}%, ${l}%)`
})

export default EventColorProvider
