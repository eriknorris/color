/**
 * # todo:
 * ## [ ] Status / Benefit:Complxity / "Description"

 * [ ] 3:1 "Think about patreon / monetizing / sponsoring"
 * [ ] 3:1 "Make a SVG/Image export"
 * [x] 3:1 "Add Close ICON to customize pannel"
 * [ ] 3:1 "Add a section with simple text. (Possibly the color space descriptions"
 * [x] 3:1 "Make colors clickable (Change Context color on click)"
 * [ ] 3:2 "Add some kind of nav (dots or something for the different views)"
 * [ ] 3:3 "Save settings"
 * [ ] 3:3 "FF & Safari testing"
 * [ ] 3:3 "Mobile Friendlyness"

 * [X] 2:1 "Add HWB"
 * [ ] 2:1 "Add CIELCHuv"
 * [x] 2:1 "More padding in pannel"
 * [x] 2:1 "Have a default background color per mode"
 * [x] 2:1 "Write a short paragraph for each color space"
 * [ ] 2:2 "overlay preview gradients over sliders"
 * [ ] 2:2 "Only render views when they are close the the scrollable area"
 * [ ] 2:2 "Add stats (metrics: I what to know if people scroll, and what they interact with)"
 * [ ] 2:2 "Make values inputable on sliders (text input)"
 * [ ] 2:2 "Add starting color"
 * [x] 2:3 "Make it possible to add colors manually (black / white)"
 * [ ] 2:3 "Make a draggable view to be able to compose colors manually" https://github.com/catc/displace

 * [x] 1:1 "Automatically close the sidepannel when scrolling a bit"
 * [ ] 1:1 "Collabsible Footer"
 * [x] 1:1 "Add HCL color space (no need is the same as LCH)"
 * [ ] 1:1 "Make UI hideable"
 * [ ] 1:1 "Replace chroma.js with culori"
 * [~] 1:2 "Font weight / leight height tuning"
 * [x] 1:2 "Wheel over font"

**/

console.clear();

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';

Vue.component('vue-multiselect', window.VueMultiselect.default);

const contrastMinimums = {
  aa: 4.5,
  aaLarge: 3,
  aaa: 7,
  aaaLarge: 4.5 };


const ypbprToRGB = (y, pb, pr, kb = 0.0722, kr = 0.2126) => {

  const r = y + 2 * pr * (1 - kr);
  const b = y + 2 * pb * (1 - kb);
  const g = (y - kr * r - kb * b) / (1 - kr - kb);

  return [r * 255, g * 255, b * 255];
};

const ucsToxyz = function (ucs) {
  const u = ucs[0],
  v = ucs[1],
  w = ucs[2];

  return [
  1.5 * u,
  v,
  1.5 * u - 3 * v + 2 * w];

};

function ryb2rgb(color) {
  var r = color[0],y = color[1],b = color[2];
  // Remove the whiteness from the color.
  var w = Math.min(r, y, b);
  r -= w;
  y -= w;
  b -= w;

  var my = Math.max(r, y, b);

  // Get the green out of the yellow and blue
  var g = Math.min(y, b);
  y -= g;
  b -= g;

  if (b && g) {
    b *= 2.0;
    g *= 2.0;
  }

  // Redistribute the remaining yellow.
  r += y;
  g += y;

  // Normalize to values.
  var mg = Math.max(r, g, b);
  if (mg) {
    var n = my / mg;
    r *= n;
    g *= n;
    b *= n;
  }

  // Add the white back in.
  r += w;
  g += w;
  b += w;

  // And return back the ryb typed accordingly.
  return [r, g, b];
}

const xyzToRGB = function (_xyz, white = [100, 100, 100]) {

  const x = _xyz[0] / white[0],
  y = _xyz[1] / white[1],
  z = _xyz[2] / white[2];

  // assume sRGB
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  let r = x * 3.240969941904521 + y * -1.537383177570093 + z * -0.498610760293;
  let g = x * -0.96924363628087 + y * 1.87596750150772 + z * 0.041555057407175;
  let b = x * 0.055630079696993 + y * -0.20397695888897 + z * 1.056971514242878;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 :
  r = r * 12.92;

  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 :
  g = g * 12.92;

  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 :
  b = b * 12.92;

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
};

const colorSpaces = [
{
  name: ['EDG-RGB-Hue'],
  hasStart: false,
  bg: '#212121',
  attr: [
  {
    name: 'stops',
    type: 'colorlist',
    value: [
    '#72ffd7',
    '#f03b50',
    '#0f0b50'] },


  {
    name: 'edg-mix',
    min: .2,
    max: .8,
    step: .001,
    value: .5,
    type: 'range' },

  {
    name: 'space-a',
    value: 'rgb',
    values: ['lab', 'hsl', 'hsv', 'hsi', 'lch', 'rgb', 'lrgb'],
    type: 'list' },

  {
    name: 'space-b',
    value: 'hsv',
    values: ['lab', 'hsl', 'hsv', 'hsi', 'lch', 'rgb', 'lrgb'],
    type: 'list' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let scaleRGB = chroma.scale(attrs['stops'].value).mode(attrs['space-a'].value).colors(options.colors);
    let scaleHSV = chroma.scale(attrs['stops'].value).mode(attrs['space-b'].value).colors(options.colors);


    /*let padding = parseFloat(attrs.padding.value);
    if (padding !== 0) {
      scale.padding(padding);
    }*/
    return scaleRGB.map((color, i) => {
      return chroma.mix(color, scaleHSV[i], attrs['edg-mix'].value, 'rgb').hex();
    });

  } },

{
  name: ['HSL', 'HSLuv', 'HPLuv'],
  bg: '#212121',
  hasStart: true,
  attr: [
  {
    name: 'gradient space',
    value: 'hue',
    values: ['light', 'saturation', 'hue'],
    type: 'list',
    excludeValue: true },

  {
    name: 'hue',
    min: 0,
    max: 360,
    step: 1,
    value: 0,
    type: 'range' },

  {
    name: 'saturation',
    min: 0,
    max: 1,
    step: 0.01,
    value: 1,
    type: 'range' },

  {
    name: 'light',
    min: 0,
    max: 1,
    step: 0.01,
    value: .8,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];

    let space = ['hue', 'saturation', 'light'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let color;
      let componentPercent = i / options.colors;

      if (mode.toLowerCase() === 'hsluv') {
        color = hsluv.hsluvToHex([
        iterate === space[0] ? componentPercent * 360 : parseFloat(attrs[space[0]].value),
        iterate === space[1] ? componentPercent * 100 : parseFloat(attrs[space[1]].value) * 100,
        iterate === space[2] ? componentPercent * 100 : parseFloat(attrs[space[2]].value) * 100]);

      } else if (mode.toLowerCase() === 'hpluv') {
        color = hsluv.hpluvToHex([
        iterate === space[0] ? componentPercent * 360 : parseFloat(attrs[space[0]].value),
        iterate === space[1] ? componentPercent * 100 : parseFloat(attrs[space[1]].value) * 100,
        iterate === space[2] ? componentPercent * 100 : parseFloat(attrs[space[2]].value) * 100]);

      } else {
        color = chroma.hsl([
        iterate === space[0] ? componentPercent * 360 : parseFloat(attrs[space[0]].value),
        iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value),
        iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value)]).
        get('hex');
      }
      colors.push(color);
    }

    return colors;
  } },

{
  name: ['HWB'],
  bg: '#212121',
  hasStart: true,
  attr: [
  {
    name: 'gradient space',
    value: 'blackness',
    values: ['hue', 'blackness', 'whiteness'],
    type: 'list',
    excludeValue: true },

  {
    name: 'hue',
    min: 0,
    max: 360,
    step: 1,
    value: 24,
    type: 'range' },

  {
    name: 'whiteness',
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.7,
    type: 'range' },

  {
    name: 'blackness',
    min: 0,
    max: 1,
    step: 0.01,
    value: .8,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];

    let space = ['hue', 'whiteness', 'blackness'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let color;
      let componentPercent = i / options.colors;

      let h = iterate === space[0] ? componentPercent * 360 : parseFloat(attrs[space[0]].value);
      let b = iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value);
      let w = iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value);

      let [hsvH, hsvS, hsvV] = [
      h,
      b === 1 ? 0 : 1 - w / (1 - b) * 1,
      1 - w];


      color = chroma.hsv([
      hsvH,
      hsvS,
      hsvV]).
      get('hex');

      colors.push(color);
    }

    return colors;
  } },

{
  name: ['XYZ'],
  bg: '#212121',
  hasStart: true,
  attr: [
  {
    name: 'gradient space',
    value: 'y',
    values: ['x', 'y', 'z'],
    type: 'list',
    excludeValue: true },

  {
    name: 'x',
    min: 0,
    max: 95.045592705167,
    step: 0.01,
    value: 29,
    type: 'range' },

  {
    name: 'y',
    min: 0,
    max: 100,
    step: 0.01,
    value: 20,
    type: 'range' },

  {
    name: 'z',
    min: 0,
    max: 108.9057750759878,
    step: 0.01,
    value: 70,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];

    let space = ['x', 'y', 'z'];
    let iterate = attrs['gradient space'].value;
    let max = attrs[iterate].max;

    for (let i = 0; i < options.colors; i++) {
      let color;
      let componentPercent = i / options.colors * max;

      let x = iterate === space[0] ? componentPercent : parseFloat(attrs[space[0]].value);
      let y = iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value);
      let z = iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value);

      let rgb = xyzToRGB([x, y, z]);

      color = chroma.rgb(rgb).get('hex');

      colors.push(color);
    }

    return colors;
  } },

{
  name: ['ucs'],
  bg: '#212121',
  hasStart: true,
  attr: [
  {
    name: 'gradient space',
    value: 'u',
    values: ['u', 'v', 'w'],
    type: 'list',
    excludeValue: true },

  {
    name: 'u',
    min: 0,
    max: 100,
    step: 0.01,
    value: 29,
    type: 'range' },

  {
    name: 'v',
    min: 0,
    max: 100,
    step: 0.01,
    value: 20,
    type: 'range' },

  {
    name: 'w',
    min: 0,
    max: 100,
    step: 0.01,
    value: 70,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];

    let space = ['u', 'v', 'w'];
    let iterate = attrs['gradient space'].value;
    let max = attrs[iterate].max;

    for (let i = 0; i < options.colors; i++) {
      let color;
      let componentPercent = i / options.colors * max;

      let u = iterate === space[0] ? componentPercent : parseFloat(attrs[space[0]].value);
      let v = iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value);
      let w = iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value);

      let rgb = xyzToRGB(ucsToxyz([u, v, w]));

      color = chroma.rgb(rgb).get('hex');

      colors.push(color);
    }

    return colors;
  } },

{
  name: ['Harmonies'],
  hasStart: false,
  bg: '#212121',
  attr: [
  {
    name: 'color',
    type: 'color',
    value: '#72ffd7' },

  {
    name: 'scheme',
    value: 'splitcomplementary',
    values: ['complementary', 'splitcomplementary', 'triadic', 'tetradic', 'analogous', 'square'],
    type: 'list',
    harmonies: {
      complementary: { h: [0, 180] },
      splitcomplementary: { h: [0, 150, 210] },
      triadic: { h: [0, 120, 240] },
      tetradic: { h: [0, 60, 180, 240] },
      analogous: { h: [-30, 0, 30] },
      square: { h: [0, 90, 180, 270] } } },


  {
    name: 'space',
    value: 'lab',
    values: ['lab', 'hsl', 'hsv', 'hsi', 'lch', 'rgb', 'lrgb', 'num'],
    type: 'list' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    const harmonies = attrs['scheme'].harmonies;
    const harmonyModel = harmonies[attrs['scheme'].value];
    const color = attrs['color'].value;
    const colors = [];

    for (let componentKey in harmonyModel) {
      let currentColor = chroma(color);
      for (let val in harmonyModel[componentKey]) {
        let value = harmonyModel[componentKey][val];
        let operator = Math.sign(value) < 0 ? '-' : '+';

        colors.push(currentColor.set('hsl.' + componentKey, operator + Math.abs(value)).hex());
      }
    }
    return chroma.scale(colors).mode(attrs['space'].value).colors(options.colors);

  } },

{
  name: ['cubehelix'],
  hasStart: false,
  bg: '#212121',
  attr: [
  {
    name: 'start',
    min: 0,
    max: 360,
    step: 1,
    value: 0,
    type: 'range' },

  {
    name: 'rotations',
    min: -2,
    max: 2,
    step: 0.01,
    value: -0.65,
    type: 'range' },

  {
    name: 'hue',
    min: 0,
    max: 1,
    step: 0.01,
    value: 1,
    type: 'range' },

  {
    name: 'gamma',
    min: 0,
    max: 1,
    step: 0.01,
    value: 1,
    type: 'range' },

  {
    name: 'lightness min',
    min: 0,
    max: 0.9,
    step: 0.01,
    value: 0.2,
    type: 'range' },

  {
    name: 'lightness max',
    min: 0.1,
    max: 1,
    step: 0.01,
    value: 0.8,
    type: 'range' },

  {
    name: 'padding',
    min: -.49,
    max: .49,
    step: 0.001,
    value: 0,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = chroma.cubehelix().
    start(parseFloat(attrs['start'].value)).
    rotations(parseFloat(attrs['rotations'].value)).
    hue(
    parseFloat(attrs['hue'].value)).

    gamma(
    parseFloat(attrs['gamma'].value)).

    lightness([
    parseFloat(attrs['lightness min'].value),
    parseFloat(attrs['lightness max'].value)]).

    scale();

    let padding = parseFloat(attrs.padding.value);
    if (padding !== 0) {
      colors.padding(padding);
    }

    return colors.colors(options.colors);
  } },

{
  name: ['RGB'],
  hasStart: true,
  bg: '#212121',
  attr: [
  {
    name: 'gradient space',
    value: 'red',
    values: ['red', 'green', 'blue'],
    type: 'list',
    excludeValue: true },

  {
    name: 'red',
    min: 0,
    max: 255,
    step: 1,
    value: 20,
    type: 'range' },

  {
    name: 'green',
    min: 0,
    max: 255,
    step: 1,
    value: 88,
    type: 'range' },

  {
    name: 'blue',
    min: 0,
    max: 255,
    step: 1,
    value: 100,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];
    let space = ['red', 'green', 'blue'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let componentPercent = Math.ceil(i / (options.colors - 1) * 255);
      let color = chroma.rgb([
      iterate === space[0] ? componentPercent : parseFloat(attrs[space[0]].value),
      iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value),
      iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value)]).
      get('hex');

      colors.push(color);
    }
    return colors;
  } },

{
  name: ['RYB'],
  hasStart: true,
  bg: '#212121',
  attr: [
  {
    name: 'gradient space',
    value: 'yellow',
    values: ['red', 'yellow', 'blue'],
    type: 'list',
    excludeValue: true },

  {
    name: 'red',
    min: 0,
    max: 255,
    step: 1,
    value: 255,
    type: 'range' },

  {
    name: 'yellow',
    min: 0,
    max: 255,
    step: 1,
    value: 88,
    type: 'range' },

  {
    name: 'blue',
    min: 0,
    max: 255,
    step: 1,
    value: 125,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];
    let space = ['red', 'yellow', 'blue'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let componentPercent = Math.ceil(i / (options.colors - 1) * 255);
      let rgb = ryb2rgb([
      iterate === space[0] ? componentPercent : parseFloat(attrs[space[0]].value),
      iterate === space[1] ? componentPercent : parseFloat(attrs[space[1]].value),
      iterate === space[2] ? componentPercent : parseFloat(attrs[space[2]].value)]);


      let color = chroma.rgb(rgb).get('hex');

      colors.push(color);
    }
    return colors;
  } },

{
  name: ['YPbPr'],
  hasStart: true,
  bg: '#212121',
  attr: [
  {
    name: 'gradient space',
    value: 'Y',
    values: ['Y', 'Pb', 'Pr'],
    type: 'list',
    excludeValue: true },

  {
    name: 'Y',
    min: 0,
    max: 1,
    step: 0.0001,
    value: 0,
    type: 'range' },

  {
    name: 'Pb',
    min: -0.5,
    max: 0.5,
    step: 0.0001,
    value: -0.5,
    type: 'range' },

  {
    name: 'Pr',
    min: -0.5,
    max: 0.5,
    step: 0.0001,
    value: 0.5,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];
    let space = ['Y', 'Pb', 'Pr'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let componentPercent = i / (options.colors - 1);
      let color = chroma(
      ypbprToRGB(
      iterate === space[0] ? componentPercent : parseFloat(attrs[space[0]].value),
      iterate === space[1] ? -0.5 + componentPercent : parseFloat(attrs[space[1]].value),
      iterate === space[2] ? -0.5 + componentPercent : parseFloat(attrs[space[2]].value)),
      'rgb').
      get('hex');

      colors.push(color);
    }
    return colors;
  } },

{
  name: ['lch' /*, 'hcl'*/],
  hasStart: true,
  bg: '#fffcec',
  attr: [
  {
    name: 'gradient space',
    value: 'h',
    values: ['l', 'c', 'h'],
    type: 'list',
    excludeValue: true },

  {
    name: 'h',
    min: 0,
    max: 360,
    step: 1,
    value: 20,
    type: 'range' },

  {
    name: 'l',
    min: 0,
    max: 100,
    step: 1,
    value: 75,
    type: 'range' },

  {
    name: 'c',
    min: 0,
    max: 140,
    step: 1,
    value: 100,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];
    let space = ['l', 'c', 'h'];
    let iterate = attrs['gradient space'].value;

    //color = chroma.hcl(h, s, l).get('hex');
    for (let i = 0; i < options.colors; i++) {
      let color = chroma[mode]([
      iterate === space[0] ? Math.ceil(i / options.colors * 100) : parseFloat(attrs[space[0]].value),
      iterate === space[1] ? Math.ceil(i / options.colors * 140) : parseFloat(attrs[space[1]].value),
      iterate === space[2] ? Math.ceil(i / options.colors * 360) : parseFloat(attrs[space[2]].value)]).
      get('hex');

      colors.push(color);
    }
    return colors;
  } },

{
  name: ['lab'],
  hasStart: true,
  bg: '#f5f5f5',
  attr: [
  {
    name: 'lightness',
    min: 0,
    max: 100,
    step: 1,
    value: 74,
    type: 'range' },

  {
    name: 'green–red',
    min: -100,
    max: 100,
    step: 1,
    value: 67,
    type: 'range' },

  {
    name: 'blue–yellow',
    min: -100,
    max: 100,
    step: 1,
    value: 8,
    type: 'range' },

  {
    name: 'gradient space',
    value: 'blue–yellow',
    values: ['lightness', 'green–red', 'blue–yellow'],
    type: 'list',
    excludeValue: true }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let colors = [];
    let space = ['lightness', 'green–red', 'blue–yellow'];
    let iterate = attrs['gradient space'].value;

    for (let i = 0; i < options.colors; i++) {
      let color = chroma.lch([
      iterate === space[0] ? Math.ceil(i / options.colors * 100) : parseFloat(attrs[space[0]].value),
      iterate === space[1] ? -100 + Math.ceil(i / options.colors * 200) : parseFloat(attrs[space[1]].value),
      iterate === space[2] ? -100 + Math.ceil(i / options.colors * 200) : parseFloat(attrs[space[2]].value)]).
      get('hex');
      colors.push(color);
    }
    return colors;
  } },

{
  name: ['interpolate'],
  hasStart: false,
  bg: '#212121',
  attr: [
  {
    name: 'stops',
    type: 'colorlist',
    value: [
    '#72ffd7',
    '#f03b50',
    '#0f0b50'] },


  {
    name: 'space',
    value: 'lab',
    values: ['lab', 'hsl', 'hsv', 'hsi', 'lch', 'rgb', 'lrgb', 'num'],
    type: 'list' },

  {
    name: 'padding',
    min: -.49,
    max: .49,
    step: 0.001,
    value: 0,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {


    let scale = chroma.scale(attrs['stops'].value).mode(attrs['space'].value);
    let padding = parseFloat(attrs.padding.value);
    if (padding !== 0) {
      scale.padding(padding);
    }

    let colors = scale.colors(options.colors);
    /*colors = colors.map(c => {
      return chroma(c).set('hsl.h', '+20').hex();
    })*/
    return colors;
  } },

{
  name: ['matplotlib'],
  hasStart: false,
  bg: '#fdfdfd',
  attr: [
  {
    name: 'scheme',
    value: 'plasma',
    values: ['plasma', 'inferno', 'magma', 'viridis'],
    type: 'list' },

  {
    name: 'padding',
    min: -.49,
    max: .49,
    step: 0.001,
    value: 0,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    const schemes = {
      'inferno': ["#000004", "#010005", "#010106", "#010108", "#02010a", "#02020c", "#02020e", "#030210", "#040312", "#040314", "#050417", "#060419", "#07051b", "#08051d", "#09061f", "#0a0722", "#0b0724", "#0c0826", "#0d0829", "#0e092b", "#10092d", "#110a30", "#120a32", "#140b34", "#150b37", "#160b39", "#180c3c", "#190c3e", "#1b0c41", "#1c0c43", "#1e0c45", "#1f0c48", "#210c4a", "#230c4c", "#240c4f", "#260c51", "#280b53", "#290b55", "#2b0b57", "#2d0b59", "#2f0a5b", "#310a5c", "#320a5e", "#340a5f", "#360961", "#380962", "#390963", "#3b0964", "#3d0965", "#3e0966", "#400a67", "#420a68", "#440a68", "#450a69", "#470b6a", "#490b6a", "#4a0c6b", "#4c0c6b", "#4d0d6c", "#4f0d6c", "#510e6c", "#520e6d", "#540f6d", "#550f6d", "#57106e", "#59106e", "#5a116e", "#5c126e", "#5d126e", "#5f136e", "#61136e", "#62146e", "#64156e", "#65156e", "#67166e", "#69166e", "#6a176e", "#6c186e", "#6d186e", "#6f196e", "#71196e", "#721a6e", "#741a6e", "#751b6e", "#771c6d", "#781c6d", "#7a1d6d", "#7c1d6d", "#7d1e6d", "#7f1e6c", "#801f6c", "#82206c", "#84206b", "#85216b", "#87216b", "#88226a", "#8a226a", "#8c2369", "#8d2369", "#8f2469", "#902568", "#922568", "#932667", "#952667", "#972766", "#982766", "#9a2865", "#9b2964", "#9d2964", "#9f2a63", "#a02a63", "#a22b62", "#a32c61", "#a52c60", "#a62d60", "#a82e5f", "#a92e5e", "#ab2f5e", "#ad305d", "#ae305c", "#b0315b", "#b1325a", "#b3325a", "#b43359", "#b63458", "#b73557", "#b93556", "#ba3655", "#bc3754", "#bd3853", "#bf3952", "#c03a51", "#c13a50", "#c33b4f", "#c43c4e", "#c63d4d", "#c73e4c", "#c83f4b", "#ca404a", "#cb4149", "#cc4248", "#ce4347", "#cf4446", "#d04545", "#d24644", "#d34743", "#d44842", "#d54a41", "#d74b3f", "#d84c3e", "#d94d3d", "#da4e3c", "#db503b", "#dd513a", "#de5238", "#df5337", "#e05536", "#e15635", "#e25734", "#e35933", "#e45a31", "#e55c30", "#e65d2f", "#e75e2e", "#e8602d", "#e9612b", "#ea632a", "#eb6429", "#eb6628", "#ec6726", "#ed6925", "#ee6a24", "#ef6c23", "#ef6e21", "#f06f20", "#f1711f", "#f1731d", "#f2741c", "#f3761b", "#f37819", "#f47918", "#f57b17", "#f57d15", "#f67e14", "#f68013", "#f78212", "#f78410", "#f8850f", "#f8870e", "#f8890c", "#f98b0b", "#f98c0a", "#f98e09", "#fa9008", "#fa9207", "#fa9407", "#fb9606", "#fb9706", "#fb9906", "#fb9b06", "#fb9d07", "#fc9f07", "#fca108", "#fca309", "#fca50a", "#fca60c", "#fca80d", "#fcaa0f", "#fcac11", "#fcae12", "#fcb014", "#fcb216", "#fcb418", "#fbb61a", "#fbb81d", "#fbba1f", "#fbbc21", "#fbbe23", "#fac026", "#fac228", "#fac42a", "#fac62d", "#f9c72f", "#f9c932", "#f9cb35", "#f8cd37", "#f8cf3a", "#f7d13d", "#f7d340", "#f6d543", "#f6d746", "#f5d949", "#f5db4c", "#f4dd4f", "#f4df53", "#f4e156", "#f3e35a", "#f3e55d", "#f2e661", "#f2e865", "#f2ea69", "#f1ec6d", "#f1ed71", "#f1ef75", "#f1f179", "#f2f27d", "#f2f482", "#f3f586", "#f3f68a", "#f4f88e", "#f5f992", "#f6fa96", "#f8fb9a", "#f9fc9d", "#fafda1", "#fcffa4"],
      'magma': ["#000004", "#010005", "#010106", "#010108", "#020109", "#02020b", "#02020d", "#03030f", "#030312", "#040414", "#050416", "#060518", "#06051a", "#07061c", "#08071e", "#090720", "#0a0822", "#0b0924", "#0c0926", "#0d0a29", "#0e0b2b", "#100b2d", "#110c2f", "#120d31", "#130d34", "#140e36", "#150e38", "#160f3b", "#180f3d", "#19103f", "#1a1042", "#1c1044", "#1d1147", "#1e1149", "#20114b", "#21114e", "#221150", "#241253", "#251255", "#271258", "#29115a", "#2a115c", "#2c115f", "#2d1161", "#2f1163", "#311165", "#331067", "#341069", "#36106b", "#38106c", "#390f6e", "#3b0f70", "#3d0f71", "#3f0f72", "#400f74", "#420f75", "#440f76", "#451077", "#471078", "#491078", "#4a1079", "#4c117a", "#4e117b", "#4f127b", "#51127c", "#52137c", "#54137d", "#56147d", "#57157e", "#59157e", "#5a167e", "#5c167f", "#5d177f", "#5f187f", "#601880", "#621980", "#641a80", "#651a80", "#671b80", "#681c81", "#6a1c81", "#6b1d81", "#6d1d81", "#6e1e81", "#701f81", "#721f81", "#732081", "#752181", "#762181", "#782281", "#792282", "#7b2382", "#7c2382", "#7e2482", "#802582", "#812581", "#832681", "#842681", "#862781", "#882781", "#892881", "#8b2981", "#8c2981", "#8e2a81", "#902a81", "#912b81", "#932b80", "#942c80", "#962c80", "#982d80", "#992d80", "#9b2e7f", "#9c2e7f", "#9e2f7f", "#a02f7f", "#a1307e", "#a3307e", "#a5317e", "#a6317d", "#a8327d", "#aa337d", "#ab337c", "#ad347c", "#ae347b", "#b0357b", "#b2357b", "#b3367a", "#b5367a", "#b73779", "#b83779", "#ba3878", "#bc3978", "#bd3977", "#bf3a77", "#c03a76", "#c23b75", "#c43c75", "#c53c74", "#c73d73", "#c83e73", "#ca3e72", "#cc3f71", "#cd4071", "#cf4070", "#d0416f", "#d2426f", "#d3436e", "#d5446d", "#d6456c", "#d8456c", "#d9466b", "#db476a", "#dc4869", "#de4968", "#df4a68", "#e04c67", "#e24d66", "#e34e65", "#e44f64", "#e55064", "#e75263", "#e85362", "#e95462", "#ea5661", "#eb5760", "#ec5860", "#ed5a5f", "#ee5b5e", "#ef5d5e", "#f05f5e", "#f1605d", "#f2625d", "#f2645c", "#f3655c", "#f4675c", "#f4695c", "#f56b5c", "#f66c5c", "#f66e5c", "#f7705c", "#f7725c", "#f8745c", "#f8765c", "#f9785d", "#f9795d", "#f97b5d", "#fa7d5e", "#fa7f5e", "#fa815f", "#fb835f", "#fb8560", "#fb8761", "#fc8961", "#fc8a62", "#fc8c63", "#fc8e64", "#fc9065", "#fd9266", "#fd9467", "#fd9668", "#fd9869", "#fd9a6a", "#fd9b6b", "#fe9d6c", "#fe9f6d", "#fea16e", "#fea36f", "#fea571", "#fea772", "#fea973", "#feaa74", "#feac76", "#feae77", "#feb078", "#feb27a", "#feb47b", "#feb67c", "#feb77e", "#feb97f", "#febb81", "#febd82", "#febf84", "#fec185", "#fec287", "#fec488", "#fec68a", "#fec88c", "#feca8d", "#fecc8f", "#fecd90", "#fecf92", "#fed194", "#fed395", "#fed597", "#fed799", "#fed89a", "#fdda9c", "#fddc9e", "#fddea0", "#fde0a1", "#fde2a3", "#fde3a5", "#fde5a7", "#fde7a9", "#fde9aa", "#fdebac", "#fcecae", "#fceeb0", "#fcf0b2", "#fcf2b4", "#fcf4b6", "#fcf6b8", "#fcf7b9", "#fcf9bb", "#fcfbbd", "#fcfdbf"],
      'plasma': ["#0d0887", "#100788", "#130789", "#16078a", "#19068c", "#1b068d", "#1d068e", "#20068f", "#220690", "#240691", "#260591", "#280592", "#2a0593", "#2c0594", "#2e0595", "#2f0596", "#310597", "#330597", "#350498", "#370499", "#38049a", "#3a049a", "#3c049b", "#3e049c", "#3f049c", "#41049d", "#43039e", "#44039e", "#46039f", "#48039f", "#4903a0", "#4b03a1", "#4c02a1", "#4e02a2", "#5002a2", "#5102a3", "#5302a3", "#5502a4", "#5601a4", "#5801a4", "#5901a5", "#5b01a5", "#5c01a6", "#5e01a6", "#6001a6", "#6100a7", "#6300a7", "#6400a7", "#6600a7", "#6700a8", "#6900a8", "#6a00a8", "#6c00a8", "#6e00a8", "#6f00a8", "#7100a8", "#7201a8", "#7401a8", "#7501a8", "#7701a8", "#7801a8", "#7a02a8", "#7b02a8", "#7d03a8", "#7e03a8", "#8004a8", "#8104a7", "#8305a7", "#8405a7", "#8606a6", "#8707a6", "#8808a6", "#8a09a5", "#8b0aa5", "#8d0ba5", "#8e0ca4", "#8f0da4", "#910ea3", "#920fa3", "#9410a2", "#9511a1", "#9613a1", "#9814a0", "#99159f", "#9a169f", "#9c179e", "#9d189d", "#9e199d", "#a01a9c", "#a11b9b", "#a21d9a", "#a31e9a", "#a51f99", "#a62098", "#a72197", "#a82296", "#aa2395", "#ab2494", "#ac2694", "#ad2793", "#ae2892", "#b02991", "#b12a90", "#b22b8f", "#b32c8e", "#b42e8d", "#b52f8c", "#b6308b", "#b7318a", "#b83289", "#ba3388", "#bb3488", "#bc3587", "#bd3786", "#be3885", "#bf3984", "#c03a83", "#c13b82", "#c23c81", "#c33d80", "#c43e7f", "#c5407e", "#c6417d", "#c7427c", "#c8437b", "#c9447a", "#ca457a", "#cb4679", "#cc4778", "#cc4977", "#cd4a76", "#ce4b75", "#cf4c74", "#d04d73", "#d14e72", "#d24f71", "#d35171", "#d45270", "#d5536f", "#d5546e", "#d6556d", "#d7566c", "#d8576b", "#d9586a", "#da5a6a", "#da5b69", "#db5c68", "#dc5d67", "#dd5e66", "#de5f65", "#de6164", "#df6263", "#e06363", "#e16462", "#e26561", "#e26660", "#e3685f", "#e4695e", "#e56a5d", "#e56b5d", "#e66c5c", "#e76e5b", "#e76f5a", "#e87059", "#e97158", "#e97257", "#ea7457", "#eb7556", "#eb7655", "#ec7754", "#ed7953", "#ed7a52", "#ee7b51", "#ef7c51", "#ef7e50", "#f07f4f", "#f0804e", "#f1814d", "#f1834c", "#f2844b", "#f3854b", "#f3874a", "#f48849", "#f48948", "#f58b47", "#f58c46", "#f68d45", "#f68f44", "#f79044", "#f79143", "#f79342", "#f89441", "#f89540", "#f9973f", "#f9983e", "#f99a3e", "#fa9b3d", "#fa9c3c", "#fa9e3b", "#fb9f3a", "#fba139", "#fba238", "#fca338", "#fca537", "#fca636", "#fca835", "#fca934", "#fdab33", "#fdac33", "#fdae32", "#fdaf31", "#fdb130", "#fdb22f", "#fdb42f", "#fdb52e", "#feb72d", "#feb82c", "#feba2c", "#febb2b", "#febd2a", "#febe2a", "#fec029", "#fdc229", "#fdc328", "#fdc527", "#fdc627", "#fdc827", "#fdca26", "#fdcb26", "#fccd25", "#fcce25", "#fcd025", "#fcd225", "#fbd324", "#fbd524", "#fbd724", "#fad824", "#fada24", "#f9dc24", "#f9dd25", "#f8df25", "#f8e125", "#f7e225", "#f7e425", "#f6e626", "#f6e826", "#f5e926", "#f5eb27", "#f4ed27", "#f3ee27", "#f3f027", "#f2f227", "#f1f426", "#f1f525", "#f0f724", "#f0f921"],
      'viridis': ["#440154", "#440256", "#450457", "#450559", "#46075a", "#46085c", "#460a5d", "#460b5e", "#470d60", "#470e61", "#471063", "#471164", "#471365", "#481467", "#481668", "#481769", "#48186a", "#481a6c", "#481b6d", "#481c6e", "#481d6f", "#481f70", "#482071", "#482173", "#482374", "#482475", "#482576", "#482677", "#482878", "#482979", "#472a7a", "#472c7a", "#472d7b", "#472e7c", "#472f7d", "#46307e", "#46327e", "#46337f", "#463480", "#453581", "#453781", "#453882", "#443983", "#443a83", "#443b84", "#433d84", "#433e85", "#423f85", "#424086", "#424186", "#414287", "#414487", "#404588", "#404688", "#3f4788", "#3f4889", "#3e4989", "#3e4a89", "#3e4c8a", "#3d4d8a", "#3d4e8a", "#3c4f8a", "#3c508b", "#3b518b", "#3b528b", "#3a538b", "#3a548c", "#39558c", "#39568c", "#38588c", "#38598c", "#375a8c", "#375b8d", "#365c8d", "#365d8d", "#355e8d", "#355f8d", "#34608d", "#34618d", "#33628d", "#33638d", "#32648e", "#32658e", "#31668e", "#31678e", "#31688e", "#30698e", "#306a8e", "#2f6b8e", "#2f6c8e", "#2e6d8e", "#2e6e8e", "#2e6f8e", "#2d708e", "#2d718e", "#2c718e", "#2c728e", "#2c738e", "#2b748e", "#2b758e", "#2a768e", "#2a778e", "#2a788e", "#29798e", "#297a8e", "#297b8e", "#287c8e", "#287d8e", "#277e8e", "#277f8e", "#27808e", "#26818e", "#26828e", "#26828e", "#25838e", "#25848e", "#25858e", "#24868e", "#24878e", "#23888e", "#23898e", "#238a8d", "#228b8d", "#228c8d", "#228d8d", "#218e8d", "#218f8d", "#21908d", "#21918c", "#20928c", "#20928c", "#20938c", "#1f948c", "#1f958b", "#1f968b", "#1f978b", "#1f988b", "#1f998a", "#1f9a8a", "#1e9b8a", "#1e9c89", "#1e9d89", "#1f9e89", "#1f9f88", "#1fa088", "#1fa188", "#1fa187", "#1fa287", "#20a386", "#20a486", "#21a585", "#21a685", "#22a785", "#22a884", "#23a983", "#24aa83", "#25ab82", "#25ac82", "#26ad81", "#27ad81", "#28ae80", "#29af7f", "#2ab07f", "#2cb17e", "#2db27d", "#2eb37c", "#2fb47c", "#31b57b", "#32b67a", "#34b679", "#35b779", "#37b878", "#38b977", "#3aba76", "#3bbb75", "#3dbc74", "#3fbc73", "#40bd72", "#42be71", "#44bf70", "#46c06f", "#48c16e", "#4ac16d", "#4cc26c", "#4ec36b", "#50c46a", "#52c569", "#54c568", "#56c667", "#58c765", "#5ac864", "#5cc863", "#5ec962", "#60ca60", "#63cb5f", "#65cb5e", "#67cc5c", "#69cd5b", "#6ccd5a", "#6ece58", "#70cf57", "#73d056", "#75d054", "#77d153", "#7ad151", "#7cd250", "#7fd34e", "#81d34d", "#84d44b", "#86d549", "#89d548", "#8bd646", "#8ed645", "#90d743", "#93d741", "#95d840", "#98d83e", "#9bd93c", "#9dd93b", "#a0da39", "#a2da37", "#a5db36", "#a8db34", "#aadc32", "#addc30", "#b0dd2f", "#b2dd2d", "#b5de2b", "#b8de29", "#bade28", "#bddf26", "#c0df25", "#c2df23", "#c5e021", "#c8e020", "#cae11f", "#cde11d", "#d0e11c", "#d2e21b", "#d5e21a", "#d8e219", "#dae319", "#dde318", "#dfe318", "#e2e418", "#e5e419", "#e7e419", "#eae51a", "#ece51b", "#efe51c", "#f1e51d", "#f4e61e", "#f6e620", "#f8e621", "#fbe723", "#fde725"] };


    let scale = chroma.scale(schemes[attrs['scheme'].value]);
    let padding = parseFloat(attrs.padding.value);
    if (padding !== 0) {
      scale.padding(padding);
    }
    return scale.colors(options.colors);
  } },

{
  name: ['brewer'],
  hasStart: false,
  bg: '#212121',
  attr: [
  {
    name: 'scheme',
    value: 'Spectral',
    values: ['Spectral', 'BrBG', 'PiYG', 'PRGn', 'PuOr', 'RdBu', 'RdGy', 'RdYlBu', 'RdYlGn', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu', 'YlGn', 'YlGnBu', 'YlOrBr', 'YlOrRd'],
    type: 'list' },

  {
    name: 'padding',
    min: -.49,
    max: .49,
    step: 0.001,
    value: 0,
    type: 'range' }],


  palette: (mode, attrs, options = { correctLightness: false, colors: 32 }) => {
    let scale = chroma.scale(attrs['scheme'].value);
    let padding = parseFloat(attrs.padding.value);
    if (padding !== 0) {
      scale.padding(padding);
    }
    return scale.colors(options.colors);
  } }];



const colorSpaceNames = colorSpaces.reduce((names, space) => space.name.concat(names), []);

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    currentColors: [],
    currentNames: [],
    selectedColorIndex: -1,
    isLoading: false },

  mutations: {
    toggleLoadingStatus(state) {
      state.isLoading != state.isLoading;
    },
    updateColors(state, newColors) {
      state.currentColors = newColors;
    },
    updateSelectedColor(state, newIndex) {
      state.selectedColorIndex = newIndex;
    },
    updateNames(state, colorNames) {
      state.currentNames = colorNames;
    } },

  actions: {
    fetchNames(context) {
      fetch('https://api.color.pizza/v1/' + colors.join(',').replace(/#/g, '') + '?noduplicates=true&goodnamesonly=true').
      then(data => data.json()).then(data => {
        context.commit('updateNames', context.colors);
      });
    } },

  getters: {} });




const palette = new Vue({
  el: '#palette',
  store,
  data: function () {
    return {
      version: '0.6β',
      spaces: [...colorSpaces],
      names: [...colorSpaceNames],
      currentSpace: 'cubehelix',
      colorCount: 18,
      maxColorCount: 32,
      minColorCount: 2,
      correctLightness: false,
      views: ['wheel', 'row', '3d'],
      view: 'wheel',
      colorNames: this.$store.state.currentColors,
      bgcolor: '#212121',
      settingsVisible: false };

  },
  computed: {
    bgcolorcontrast: function () {
      return chroma.contrast(this.bgcolor, '#ffffff') > chroma.contrast(this.bgcolor, '#212121') ? '#ffffff' : '#212121';
    },
    space: function () {
      return this.spaces.filter(space => space.name.includes(this.currentSpace))[0];
    },
    currentColors: function () {
      const colors = this.colorsBySpace(this.currentSpace);

      // create a method for the flter (cache)
      this.bgcolor = this.spaces.filter(space => space.name.includes(this.currentSpace))[0].bg;

      this.getNames(colors);
      return colors;
    } },

  methods: {
    onScroll: function () {
      const scrollTop = window.scrollY;
      if (this.settingsVisible) {
        this.scrollTimer = setTimeout(() => {
          if (Math.abs(scrollTop - window.scrollY) > window.innerHeight * .2) {
            this.settingsVisible = false;
          }
        }, 200);
      }

    },
    setColorByIndex: function (index) {
      //console.log(index)
      this.bgcolor = this.currentColors[Math.min(index, this.colorCount)];
    },
    colorsBySpace: function (spaceName) {
      const space = this.spaces.filter(space => space.name.includes(spaceName))[0];
      const attrs = {};
      space.attr.forEach(arg => {
        attrs[arg.name] = arg;
      });
      let colors = space.palette(
      spaceName,
      attrs,
      {
        correctLightness: false,
        colors: this.colorCount });



      return colors;
    },
    toggleSettings: function () {
      this.settingsVisible = !this.settingsVisible;
    },
    selectCurrentSpace: function (e) {
      const val = typeof e == "string" ? e : e.target.value;
      if (this.names.includes(val)) {
        this.currentSpace = val;
      } else {
        console.error(`no color space called ${val} choose from: ${this.names.join(', ')}`);
      }
    },
    getNames: function (colors) {
      fetch('https://api.color.pizza/v1/' + colors.join(',').replace(/#/g, '') + '?noduplicates=true&goodnamesonly=true').then(data => data.json()).then(data => {
        this.colorNames = data.colors;
        this.$store.commit('updateNames', data.colors);
      });
    },
    getColorName: function (index) {
      if (this.colorNames.length && this.colorNames[index]) {
        return this.colorNames[index].name;
      }
    } },

  mounted() {
    // const io = new IntersectionObserver(sentinelListener);

    //io.observe(this.$el);

    // @hook:mounted="childMounted"
    console.log('mounted', this);
    window.addEventListener('scroll', this.onScroll);
  } });


Vue.component(
'setting',
{
  template: `<component :is="multifield ? 'div' : 'label'" class="setting">
      <h3 class="setting__label">{{label}}</h3>
      <span v-if="value" class="setting__value">{{value}}</span>
      <slot />
    </component>`,
  props: {
    label: String,
    value: Number,
    multifield: Boolean } });




Vue.component(
'colorlistinput',
{
  template: `<div class="setting__colors">
      <div v-for="(color, i) in colors" class="setting__color">
        <input type="color" v-bind:value="color" v-on:input="(event) => { updateColors(event, i) }"/>
        <button v-if="colors.length> 2" v-on:click="removeColor(i)">×</button>
        <strong>{{color}}</strong>
      </div>
      <button v-on:click="addColor">Add Color</button>
    </div>`,
  props: {
    colors: Array },

  methods: {
    updateColors: function (e, i) {
      this.colors[i] = e.target.value;
      this.$set(this, 'colors', this.colors);
      this.$forceUpdate();
      this.$emit('change', this.colors);
    },
    addColor: function () {
      this.colors.push(chroma.random().hex());
    },
    removeColor: function (i) {
      this.colors.splice(i, 1);
    } } });




Vue.component(
'hhead',
{
  template: `<header class="palette--header">
    <h1 v-bind:style="txtshadow">{{colorname}}</h1>
    <h2>{{color}}</h2>
  </header>`,
  props: {
    title: String,
    color: String,
    colors: Array },

  data: function () {
    return {
      colorname: 'color.pizza' };

  },
  computed: {
    txtshadow: function () {
      let textShadow = '';
      this.colors.forEach((col, i) => {
        textShadow += (i ? ',' : '') + `${i * 2}px ${i * 2}px 0 ${col} `;
      });
      return `--text-shadow: ${textShadow}`;
    } },

  watch: {
    color: function () {
      fetch('https://api.color.pizza/v1/' + this.color.replace('#', '')).then(data => data.json()).then(data => {
        this.colorname = data.colors[0].name;
      });
    } } });





Vue.component(
'colorwheel',
{
  template: `
      <div class="view view--wheel">
        <div class="fan" v-bind:style="{transform: 'rotate(' + this.rotation + 'deg)'}">
          <article v-for="(color, index) in colors" class="blade" v-bind:style="{'background-color': color, transform: 'translateZ(' + (index) * 1.5 + 'px) rotate(' + (index / colors.length) * collabsed * 360  +'deg)'}" v-on:click="$emit('setcolor', index); setRotation(index)">
            <h2 class="blade__value"><strong>{{color}}</strong></h2>
            <h3 class="blade__label"><span class="blade__label--inner">{{names[index].name}}</span></h3>
          </article>
        </div>
      </div>
    `,
  props: {
    colors: Array,
    names: Array },

  data: function () {
    return {
      selectedIndex: 0,
      rotation: 0,
      fullturns: 0,
      collabsed: 1 };

  },
  methods: {
    setRotation: function (index) {


      this.rotation = index / this.colors.length * -360;
      this.selectedIndex = index;
    } } });




Vue.component(
'colorgradient',
{
  template: `
      <div class="view view--gradient" v-bind:style="{'background-image': 'linear-gradient(45deg, ' + colors.join(',') + ')'}"></div>
    `,
  props: {
    colors: Array,
    names: Array } });




Vue.component(
'colorball',
{
  template: `
      <div class="view view--radialgradient" v-on:click="staggered = !staggered">
        <div class="radialgradient" v-bind:style="getGradient()"></div>
      </div>
    `,
  data: function () {
    return {
      staggered: true };

  },
  props: {
    colors: Array,
    names: Array },

  methods: {
    getGradient: function () {
      const cc = this.colors.length;
      let grad = '';

      if (this.staggered) {
        grad = this.colors.reduce((str, color, i) => {
          if (i === 1) {
            str = `${str} 0%, ${str} 0 ${i / cc * 100}%`;
          }

          return str + `, ${color} 0 ${i / cc * 100}%`;
        });
      } else {
        grad = this.colors.join(',');
      }

      return `background-image: radial-gradient(circle at center, ${grad})`;
    } } });





Vue.component(
'colorlist',
{
  template: `
      <div class="view view--list" v-bind:style="{'background-image': 'linear-gradient(' + colors.join(',') + ')'}">
        <ol class="color-list view--list__list">
        <li class="color-list__item" v-for="(color, index) in colors" v-bind:style="{'background-color': color, 'color': color}">
          <span class="color-list__value">{{color}}</span>
          <span class="color-list__name">{{names[index].name}}</span>
        </li>
        </ol>
      </div>
    `,
  props: {
    colors: Array,
    names: Array } });




function translate(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * ((value - low1) / (high1 - low1));
}

Vue.component(
'cube',
{
  template: `
      <div class="view view--cube" ref="container">
        <div class="select-wrap">
          <select v-model="cMode">
            <option v-for="(obj, colorMode) in colorModes" v-bind:value="colorMode">{{colorMode}}</option>
          <select />
        </div>
      </div>
    `,
  props: {
    bgcolorcontrast: String,
    colors: Array,
    names: Array },

  data: function () {
    return {
      cubeSize: 100,
      dotSize: 5,
      cDark: '#212121',
      cLight: '#ffffff',
      cMode: 'rgb',
      objects: [],
      colorModes: {
        hsv: {
          func: 'hsv',
          x: [0, 360],
          y: [1, 1],
          z: [2, 1] },

        hsi: {
          func: 'hsi',
          x: [0, 360],
          y: [1, 1],
          z: [2, 1] },

        hsl: {
          func: 'hsl',
          x: [0, 360],
          y: [1, 1],
          z: [2, 1] },

        rgb: {
          func: 'rgb',
          x: [0, 255],
          y: [1, 255],
          z: [2, 255] },

        lab: {
          func: 'lab',
          z: [0, 100],
          y: [1, 127, -128],
          x: [2, 127, -128] },

        lch: {
          func: 'lch',
          z: [0, 100],
          y: [1, 140],
          x: [2, 0, 360] } } };



  },
  methods: {
    onWindowResize: function () {
      this.width = window.innerWidth + 1;
      this.height = window.innerHeight + 1;
      this.cam.aspect = this.width / this.height;
      this.cam.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    },

    render() {
      this.controls.update();
      this.renderer.render(this.scene, this.cam);
    },

    cube: function (size) {
      const h = size * 0.5;
      const geometry = new THREE.Geometry();
      geometry.vertices.push(
      new THREE.Vector3(-h, -h, -h),
      new THREE.Vector3(-h, h, -h),
      new THREE.Vector3(-h, h, -h),
      new THREE.Vector3(h, h, -h),
      new THREE.Vector3(h, h, -h),
      new THREE.Vector3(h, -h, -h),
      new THREE.Vector3(h, -h, -h),
      new THREE.Vector3(-h, -h, -h),
      new THREE.Vector3(-h, -h, h),
      new THREE.Vector3(-h, h, h),
      new THREE.Vector3(-h, h, h),
      new THREE.Vector3(h, h, h),
      new THREE.Vector3(h, h, h),
      new THREE.Vector3(h, -h, h),
      new THREE.Vector3(h, -h, h),
      new THREE.Vector3(-h, -h, h),
      new THREE.Vector3(-h, -h, -h),
      new THREE.Vector3(-h, -h, h),
      new THREE.Vector3(-h, h, -h),
      new THREE.Vector3(-h, h, h),
      new THREE.Vector3(h, h, -h),
      new THREE.Vector3(h, h, h),
      new THREE.Vector3(h, -h, -h),
      new THREE.Vector3(h, -h, h));

      return geometry;
    },

    addCube: function (color) {
      let geometryCube = this.cube(this.cubeSize);
      //THREE.Line.computeLineDistances;
      //geometryCube
      const colorspace = new THREE.LineSegments(geometryCube,
      new THREE.LineDashedMaterial(
      {
        color: this.bgcolorcontrast || 0xffffff,
        dashSize: 1,
        gapSize: 1,
        linewidth: 1,
        //transparent: true,
        blending: THREE.AdditiveBlending }));




      colorspace.name = 'colorspace';

      this.objects.push(colorspace);
      this.scene.add(colorspace);

      this.spaceCube = colorspace;
    },
    addParticles: function () {
      // create the particle variables
      const particleCount = this.colors.length;
      const particles = new THREE.Geometry();
      const pMaterial = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors
        //size: this.dotSize,

        /*
        map: createCanvasMaterial('#fff'),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: true,
        alphaTest: .5
        */ });


      let colors = [];

      const mode = this.colorModes[this.cMode];

      this.colors.forEach(col => {
        let colorComp;

        if (mode.func === 'yuv') {
          colorComp = this.yuv(chroma(col).rgb());
        } else {
          colorComp = chroma(col)[mode.func]();
        }

        let pX = translate(colorComp[mode.x[0]], mode.x[2] || 0, mode.x[1], -this.cubeSize * .5, this.cubeSize * .5),
        pZ = translate(colorComp[mode.z[0]], mode.z[2] || 0, mode.z[1], -this.cubeSize * .5, this.cubeSize * .5),
        pY = translate(colorComp[mode.y[0]], mode.y[2] || 0, mode.y[1], -this.cubeSize * .5, this.cubeSize * .5);

        if (mode.func === 'hsl' || mode.func === 'hsv' || mode.func === 'hsi') {
          let theta = Math.PI * colorComp[mode.x[0]] / 180;
          let r = colorComp[mode.y[0]] * (this.cubeSize * .5);

          pY = r * Math.cos(theta);
          pX = r * Math.sin(theta);
        }

        if (mode.func === 'lch') {
          let theta = Math.PI * colorComp[mode.x[0]] / 180;
          let r = translate(colorComp[mode.y[0]], 0, mode.y[1], 0, this.cubeSize * .5);

          pY = r * Math.cos(theta);
          pX = r * Math.sin(theta);
        }

        const particle = new THREE.Vector3(pX, pY, pZ),
        Tcolor = new THREE.Color(col);

        //colors.push(Tcolor)

        // add it to the geometry
        //particles.vertices.push(particle);

        const sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(this.dotSize * .4, 2),
        new THREE.MeshStandardMaterial({
          flatShading: true
          //roughness: 0.1,
          //metalness: 0.7
        }));


        this.scene.add(sphere);
        this.objects.push(sphere);

        sphere.position.set(pX, pY, pZ);
        sphere.material.emissive = Tcolor;
      });


      // create the particle system
      /*const particleSystem = new THREE.Points(
        particles,
        pMaterial
      );
       particleSystem.name = 'colors';
      particles.colors = colors;*/


      // add it to the scene
      //this.objects.push(particleSystem);
      //this.scene.add(particleSystem);
      //this.part = particleSystem;
    },
    reset: function () {
      clearTimeout(this.debouncer);
      this.debouncer = setTimeout(() => {
        this.objects = [];
        while (this.scene.children.length > 0) {
          this.scene.remove(this.scene.children[0]);
        }
        this.addCube();
        this.addParticles();
        this.renderer.render(this.scene, this.cam);
      }, 50);
    } },

  watch: {
    bgcolorcontrast: function () {
      this.reset();
    },
    cMode: function () {
      this.reset();
    },
    colors: function () {
      this.reset();
    } },

  mounted() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.cam = new THREE.PerspectiveCamera(60, width / height, 1, 400);
    this.cam.position.z = this.cubeSize * 1.75;
    this.scene = new THREE.Scene();
    this.root = new THREE.Object3D();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    this.addCube();

    this.controls = new OrbitControls(this.cam, this.renderer.domElement);

    //const light = new THREE.SpotLight(0xffffff, 1, 80, Math.PI * 0.25, 1, 2);
    //light.position.set(0, 0, 0);
    //this.scene.add(light);

    //const light2 = new THREE.PointLight("#EFEFEF", 2, 80, Math.PI * 0.25, 1, 2);
    //this.scene.add(light2);


    // enable animation loop when using damping or autorotation
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .75;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = .25;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = .25;
    this.controls.maxDistance = this.cubeSize * 1.75;
    this.controls.maxPolarAngle = Math.PI * 4;
    //this.controls.minPolarAngle = 0;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.minAzimuthAngle = -Infinity;


    this.controls.noPan = true;
    this.controls.noKeys = true;
    this.controls.noZoom = true;

    const container = this.$refs.container;
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize, false);
    //document.querySelector('button').addEventListener('click', toggleDarkMode, false);

    this.addParticles();

    this.renderer.render(this.scene, this.cam);
    //this.scene.background = new THREE.Color('#212121');

    this.renderer.setClearColor(0x000000, 0); // the default
    this.animate = true;

    const anim = () => {
      this.render();
      if (this.animate) {
        requestAnimationFrame(anim);
      }
    };

    anim();
  },
  beforeDestroy() {
    this.animate = false;
    window.removeEventListener('resize', this.onWindowResize, false);
  } });



Vue.component(
'colorabstract',
{
  template: `
      <div class="view view--abstract" v-bind:style="{'--gradient': gradient}">
        <div></div>
      </div>
    `,
  props: {
    colors: Array,
    names: Array },

  computed: {
    gradient: function () {
      return this.colors.join(',');
    } } });




Vue.component(
'colorwatches',
{
  template: `
      <div class="view view--watches">
        <ol class="view__watch__list">
          <li v-on:click="$emit('setcolor', index)" class="color-watch" v-for="(color, index) in colors" v-bind:style="{'background-color': color, 'color': color}">
            <div class="color-watch__wrap">
              <div class="color-watch__inner">
                <div class="color-watch__swatch">
                  <div class="color-watch__swatch__shade"></div>
                  <div class="color-watch__swatch__shade"></div>
                  <div class="color-watch__swatch__shade"></div>
                </div>
                <div class="color-watch__label">
                  <span class="color-watch__title">{{names[index].name}}</span>
                  <span class="color-watch__subtitle">{{color}}</span>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>
    `,
  props: {
    colors: Array,
    names: Array } });




Vue.component(
'colorpie',
{
  template: `
      <div class="view view--pie" v-on:click="zoomed = !zoomed">
        <div class="pie__wrap" ref="svg">
          <svg class="pie" v-bind:class="{'pie--zoomed': zoomed}" viewBox="-2 -2 4 4" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="blur" x="0" y="0">
                <feGaussianBlur in="SourceGraphic" stdDeviation=".03" />
              </filter>
            </defs>
            <path v-for="(color, index) in colors" v-bind:d="getPath(index, colors.length)" v-bind:fill="color" />
          </svg>
        </div>
      </div>
    `,
  data: function () {
    return {
      zoomed: true };

  },
  props: {
    colors: Array,
    names: Array },

  mounted() {
    document.addEventListener('mousemove', event => {
      let angle = Math.atan2(event.clientY - window.innerHeight * .5, event.clientX - window.innerWidth * .5);
      angle = angle * (180 / Math.PI);
      this.$refs.svg.style.transform = `rotate(${angle}deg)`;
    });
  },
  methods: {
    getCoordinatesForPercent: percent => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    },
    getPath: function (index, total) {
      const [startX, startY] = this.getCoordinatesForPercent(index / total - 0.001);
      const [endX, endY] = this.getCoordinatesForPercent((index + 1) / total + 0.001);

      const largeArcFlag = total < 3 ? 1 : 0;

      const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      `L 0 0` // Line
      ].join(' ');

      return pathData;
    } } });




Vue.component(
'colorrows',
{
  template: `
      <div class="view view--rows">
        <ol class="view--rows__list">
        <li class="color__row" v-for="(color, index) in colors" v-bind:style="{'background-color': color, 'color': color}">
          <span class="color__row__label">
            <div class="color__row__title">{{color}}</div>
            <div class="color__row__subtitle">{{names[index].name}}</div>
          </span>
        </li>
        </ol>
      </div>
    `,
  props: {
    colors: Array,
    names: Array } });





Vue.component(
'itten',
{
  template: `
      <div class="view view--itten" v-bind:class="'itten--' + currentView">
        <div class="itten__list">
          <div class="itten__item" v-for="(color, index) in colors">
            <div class="color__itten" v-bind:style="{'background-color': color, 'color': colors[colors.length - index - 1]}">
            </div>
            <strong class="itten__name">
              {{names[index].name}} <em>↔</em> {{names[colors.length - index - 1].name}}</strong>
          </div>
        </div>
        <div class="ittem-vues">
          <button v-on:click="currentView='ball'">●</button>
          <button v-on:click="currentView='cube'">■</button>
          <button v-on:click="currentView='triangle'">▲</button>
        </div>
      </div>
    `,
  data: function () {
    return {
      currentView: 'ball' };

  },
  props: {
    colors: Array,
    names: Array } });




Vue.component(
'ellogo',
{
  template: `
      <svg class="elastiq-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 613 433">
      <path class="font" d="M311.54 203.84a9 9 0 0 0-1.91.21 7.74 7.74 0 0 0-1.83.64 4 4 0 0 0-1.4 1.15 2.81 2.81 0 0 0 1.49 4.38 29.19 29.19 0 0 0 7 1.45 17.65 17.65 0 0 1 8.93 3.36 9.22 9.22 0 0 1 3.4 7.7q0 7.49-5.23 11.74t-14.51 4.25a21.41 21.41 0 0 1-8-1.36 17.6 17.6 0 0 1-5.53-3.4 14.1 14.1 0 0 1-3.28-4.51 12.64 12.64 0 0 1-1.19-4.68l10.55-2.55a7.32 7.32 0 0 0 2.38 4.81q2.13 2 6.47 2a13.24 13.24 0 0 0 5.19-.94 3.34 3.34 0 0 0 2.21-3.32 3.24 3.24 0 0 0-1.7-2.85q-1.7-1.06-6.3-1.49a17.19 17.19 0 0 1-9.74-3.49 9.73 9.73 0 0 1-3.62-7.91 13.4 13.4 0 0 1 1.49-6.38 14 14 0 0 1 4-4.68 17.87 17.87 0 0 1 5.74-2.85 23.84 23.84 0 0 1 6.85-1 20.07 20.07 0 0 1 7.4 1.19 15 15 0 0 1 4.85 3 11.8 11.8 0 0 1 2.76 3.87 15.47 15.47 0 0 1 1.15 3.87l-10.45 2.72a5.27 5.27 0 0 0-2.13-3.62 8.32 8.32 0 0 0-5.04-1.31zm39.25 1.68h-11.91v-10.19H353l3.91-18.55h10.72l-3.92 18.55h14.63v10.19h-16.83l-4.8 21.89.85.6 11.4-7.83 5.36 8-12.3 8.34a12 12 0 0 1-6.89 2.21 10.08 10.08 0 0 1-3.57-.64 8.74 8.74 0 0 1-5-4.72 9.22 9.22 0 0 1-.77-3.83 8 8 0 0 1 .08-1.23q.08-.55.25-1.49zm63.58 31a11.67 11.67 0 0 1-3.49 1.7 12.69 12.69 0 0 1-3.49.51 10.08 10.08 0 0 1-3.57-.64 9.25 9.25 0 0 1-3-1.79 8 8 0 0 1-2-2.81 9.16 9.16 0 0 1-.72-3.7 12.25 12.25 0 0 1 .34-3l5.1-21.36-.85-.6-11.4 7.83-5.36-8 12.34-8.34a11.68 11.68 0 0 1 3.49-1.7 12.68 12.68 0 0 1 3.49-.51 10.11 10.11 0 0 1 3.57.64 9.28 9.28 0 0 1 3 1.79 8 8 0 0 1 2 2.81 9.18 9.18 0 0 1 .72 3.7 12.32 12.32 0 0 1-.34 3l-5.11 21.36.85.6 11.4-7.83 5.36 8zm7.4-53.69a8 8 0 0 1-.64 3.19 7.68 7.68 0 0 1-1.74 2.55 8.57 8.57 0 0 1-2.59 1.7 7.82 7.82 0 0 1-3.11.64 7.72 7.72 0 0 1-3.15-.64 8.69 8.69 0 0 1-2.55-1.7 7.67 7.67 0 0 1-1.74-2.55 8.29 8.29 0 0 1 0-6.38 7.71 7.71 0 0 1 1.74-2.55 8.73 8.73 0 0 1 2.55-1.7 7.7 7.7 0 0 1 3.15-.64 7.8 7.8 0 0 1 3.11.64 8.61 8.61 0 0 1 2.59 1.7 7.72 7.72 0 0 1 1.74 2.55 8 8 0 0 1 .64 3.18zm42.8 48.58h-1.53a21.9 21.9 0 0 1-2.13 2.77 13 13 0 0 1-2.85 2.34 14.44 14.44 0 0 1-4 1.62 21.53 21.53 0 0 1-5.36.6 14 14 0 0 1-10.17-4.25 14.71 14.71 0 0 1-3.15-4.94 17.39 17.39 0 0 1-1.15-6.47 37.71 37.71 0 0 1 1.57-10.93 28.53 28.53 0 0 1 4.64-9.23 23.16 23.16 0 0 1 7.49-6.38 21 21 0 0 1 10.12-2.38q5.19 0 7.79 2.13a10.62 10.62 0 0 1 3.53 5.19h1.53l1.28-6.13h10.72l-10.47 48.92.85.6 4.76-3.23 5.36 8-5.7 3.74a11.59 11.59 0 0 1-3.53 1.7 13.14 13.14 0 0 1-3.46.44 9.35 9.35 0 0 1-6.51-2.42 8.55 8.55 0 0 1-2.68-6.68 13.84 13.84 0 0 1 .34-2.81zm-10.38-2.89a12.38 12.38 0 0 0 5.62-1.28 14.13 14.13 0 0 0 4.42-3.45 15.84 15.84 0 0 0 2.89-5 17 17 0 0 0 1-5.87 8.39 8.39 0 0 0-2.34-6.34 9 9 0 0 0-6.51-2.25 12.31 12.31 0 0 0-5.66 1.32 14 14 0 0 0-4.42 3.49 16.25 16.25 0 0 0-2.85 5 17 17 0 0 0-1 5.87q0 4.17 2.34 6.34a9.21 9.21 0 0 0 6.51 2.17z"></path>
      <path class="elastiq" d="M228.45 202.41c25.89-7.67 59 2.55 80.49-31.66 25.23-40.1 60.94-44.68 85.27-31.62 34.2 18.36 31.67 68.27 7.58 90.7-27.42 25.53-29.58 52.91-13.68 67.24 22.95 20.68 47.1-2.67 35.85-19.93-8.94-13.73-31.93-25.89-98.1 6.9-65.32 32.36-129.62 19-133.91-32.42-1.03-12.53 2.88-39.25 36.5-49.21z"></path>
      <path class="font" d="M132.3 236.52l12.41-58.55h35.31v10.72h-26.37l-2.94 13.62h23.06v10.72h-25.31l-2.89 13.78h25.14v10.71H132.3zm77.08 1.69a12.69 12.69 0 0 1-3.49.51 10.08 10.08 0 0 1-3.57-.64 9.25 9.25 0 0 1-3-1.79 8 8 0 0 1-2-2.81 9.16 9.16 0 0 1-.72-3.7 12.93 12.93 0 0 1 .34-3l9.27-38.71-.85-.6-11.4 7.83-5.36-8 12.34-8.34a11.68 11.68 0 0 1 3.49-1.7 12.67 12.67 0 0 1 3.49-.51 10.09 10.09 0 0 1 3.57.64 9.26 9.26 0 0 1 3 1.79 8.05 8.05 0 0 1 2 2.81 9.17 9.17 0 0 1 .72 3.7 14.62 14.62 0 0 1-.34 3l-9.27 38.71.85.6 11.4-7.83 5.36 8-12.34 8.35a11.68 11.68 0 0 1-3.49 1.69zm62.88-10.8l.85.6 4.08-2.89 5.36 8-5 3.4a12.39 12.39 0 0 1-7 2.21 9.85 9.85 0 0 1-5.79-1.79 7.85 7.85 0 0 1-3.23-5H260a15.69 15.69 0 0 1-1.79 2.68 9.7 9.7 0 0 1-2.5 2.1 14.05 14.05 0 0 1-3.49 1.45 17.83 17.83 0 0 1-4.72.55 14.23 14.23 0 0 1-6.13-1.32 15.05 15.05 0 0 1-4.89-3.66 17.4 17.4 0 0 1-3.28-5.49 19.3 19.3 0 0 1-1.19-6.89 35.69 35.69 0 0 1 1.53-10.63 26.73 26.73 0 0 1 4.42-8.64 20.46 20.46 0 0 1 16.59-8 12.9 12.9 0 0 1 7.4 1.87 9.08 9.08 0 0 1 3.66 4.94h1.53l1.19-5.62h10.72zm-20.55 1.11a11.54 11.54 0 0 0 9.4-4.51 15.06 15.06 0 0 0 2.42-4.81 19.73 19.73 0 0 0 .85-5.83 9.27 9.27 0 0 0-2.3-6.51 7.91 7.91 0 0 0-6.13-2.51 11.68 11.68 0 0 0-5.45 1.23 12.16 12.16 0 0 0-4 3.28 14.54 14.54 0 0 0-2.47 4.81 19.7 19.7 0 0 0-.85 5.83 10.06 10.06 0 0 0 2.08 6.3q2.07 2.72 6.45 2.72z"></path>
    </svg>` });



Vue.component(
'exportjson',
{
  template: `
      <div class="view view--export">
        <textarea>{{textexport}}</textarea>
      </div>
    `,
  props: {
    names: Array },

  computed: {
    textexport: function () {
      return this.names.map(color => {
        return {
          color: color.requestedHex,
          name: color.name };

      });
    } } });






Vue.component(
'colortext',
{
  template: `
      <section class="text view view--text" v-bind:style="{'--c-background': currentbackground, '--c-background-contrast': currentcolor}">
        <div class="text__sample">
          <h1>Color Spaces <span class="text__contrast">{{chroma.contrast(currentcolor || bgcolorcontrast, currentbackground || bgcolor).toFixed(2)}}</span></h1>
          <slot></slot>
        </div>
        <div class="text__customizer">
          <div class="text__buttons">
            <button class="text-customizer__button" v-for="color in colors" v-bind:style="{color: color}" v-on:click="setColor(color)">Aa</button><button class="text-customizer__button" v-bind:style="{color: bgcolorcontrast}" v-on:click="setColor(bgcolorcontrast)">Aa</button>
          </div>
          <div class="text__buttons">
            <button class="text-customizer-bg__button" v-for="color in colors" v-bind:style="{color: color}" v-on:click="setBgColor(color)">Aa</button><button class="text-customizer-bg__button" v-bind:style="{color: bgcolor}" v-on:click="setBgColor(bgcolor)">Aa</button>
          </div>
        </div>
      </section>
    `,
  methods: {
    setColor: function (color) {
      this.currentcolor = color;
    },
    setBgColor: function (color) {
      this.currentbackground = color;
    } },

  data: function () {
    return {
      currentcolor: '',
      currentbackground: '' };

  },
  props: {
    colors: Array,
    bgcolorcontrast: String,
    bgcolor: String } });






Vue.component(
'fattext',
{
  template: `
      <div class="view view--fattext">
        <div class="fattext-list">
          <h3 v-for="name in names" v-bind:style="{color: name.requestedHex}">{{name.name}}</h3>
        </div>
      </div>
    `,
  data: function () {
    return {};

  },
  props: {
    colors: Array,
    names: Array } });