var container = document.getElementById('map-container'),
  info        = d3.select('#map-info'),
  togglers    = d3.selectAll('.map-nav a'),
  data, population, map, fills, activeTypes = ['Poverty'];

// container.style.height = container.offsetWidth / 2 + 'px';

fills = {
  Nutrition   : '#5BA68A',
  Poverty     : '#D9C45B',
  Productivity: '#D95829',
  Resilience  : '#D90404',
  Multiple    : '#15c7eb',
  defaultFill : '#ccc'
};

// d3.select(window).on('resize', function() {
//   console.log(map);
//   // map.resize();
// });

togglers.on('click', colorize);



function colorize () {
  var type      = d3.select(this).attr('data-type'),
    activeIndex = activeTypes.indexOf(type);

  if (activeIndex === -1) {
    activeTypes.push(type);
  } else {
    activeTypes.splice(activeIndex, 1);
  }

  togglers
    .classed('active multiple', false)
    .filter(function (d, i) {
      return activeTypes.indexOf(d3.select(this).attr('data-type')) > -1;
    })
    .classed('active', true)
    .classed('multiple', activeTypes.length > 1);

  map.updateChoropleth(getColors());
  updateInfo(getCount(), getPopulation());
  event.preventDefault();
}

function updateInfo (count, pop) {
  var cType, template;

  if (!count) return info.html('');

  template = '<p>' + count + ' <small>' + (count === 1 ? 'country' : 'countries') + '</small> ' +
              ((pop / 1000000).toFixed()) + ' <small>million people</small></p>';

  info.html(template);
}

function getColors () {
  var colors = {},
    fillType = activeTypes.length === 1 ? activeTypes[0] : 'Multiple';

  data.forEach(function (d) {
    colors[d.iso3] = {fillKey: isSet(d) ? fillType : 'defaultFill'}
  });

  return colors;
}

function getCount () {
  var counter = 0;

  data.forEach(function (d) {
    if (isSet(d)) counter++;
  });

  return counter;
}


function getPopulation () {
  var pop = 0;

  data.forEach(function (d) {
    if (isSet(d)) pop += +_.find(population, {'Country Code': d.iso3}).Value;
  });

  return pop;
}


function isSet (d) {
  var isSet = activeTypes.length ? true : false;
  for (var i = activeTypes.length - 1; i >= 0; i--) {
    isSet = d[activeTypes[i]];
    if (!isSet) break;
  };
  return isSet;
} 

d3.json('data/data.json', function (error, d) {
  d3.json('data/population.json', function (error, p) {
    population = p;
    data = d;

    map = new Datamap({
      responsive: true,
      projection: 'mercator',
      element: container,
      fills: fills,
      data: getColors()
    });

    updateInfo(getCount(), getPopulation());
  });
});

