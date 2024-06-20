// https://github.com/davo/Color-Standards-and-Color-Nomenclature
console.clear();

const $a = document.querySelector('#app');

const bestContrst = hexColor => {
  return chroma.contrast(hexColor, '#fff') > 4.5 ? '#fff' : '#000';
};

const plates = {};

fetch(
'https://api.color.pizza/v1/?list=ridgway').
then(
d => d.json()).
then(dd => {
  const d = dd.colors;

  let data = d.sort((a, b) => a.meta.parsed.originalPosition < b.meta.parsed.originalPosition ? -1 : 1);

  data.forEach((c, i) => {
    if (!plates.hasOwnProperty(c.meta.plate)) {
      plates[c.meta.plate] = [];
    }

    plates[c.meta.plate].push(c);
  });

  const keys = Object.keys(plates);

  let j = 0;
  let ii = 0;

  const parentRnd = () => {
    $a.style = d.map((c, i) => {
      return `
      --rnd-${i}-a: ${Math.random()};
      --rnd-${i}-b: ${Math.random()};
    `;
    }).join('');
  };

  parentRnd();

  document.querySelector('[data-shuffle-size]').addEventListener('click', () => parentRnd());

  keys.forEach(plate => {
    if (j++ % 2) {
      //plates[plate].reverse();
    }

    const $plate = Object.assign(
    document.createElement('section'),
    {
      className: 'plate' });



    const $title = Object.assign(document.createElement('h1'), {
      innerHTML: plate,
      className: 'plate__title' });


    $plate.appendChild($title);

    plates[plate].forEach((c, i) => {
      const $color = Object.assign(
      document.createElement('aside'),
      {
        style: `
          --cd: ${c.hex};
          --cc: ${bestContrst(c.hex)};
          --rnd: var(--rnd-${ii}-a);
          --rnd2: var(--rnd-${ii}-b);
        `,
        className: 'plate__color color',
        innerHTML: `
          <img src="https://raw.githubusercontent.com/davo/Color-Standards-and-Color-Nomenclature/main/src/plate_swatches/${c.meta.image}" />
          <b>${c.name}</b>
        ` });

      ii++;

      $plate.appendChild($color);
    });

    $a.appendChild($plate);
  });
});


document.querySelector('[data-tabs]').addEventListener('click', e => {
  e.target.toggleAttribute('aria-checked');
  $a.classList.toggle('is-tabbed');
});

document.querySelector('[data-view-grid]').addEventListener('click', e => {
  e.target.toggleAttribute('aria-checked');
  $a.classList.toggle('is-stack');
});