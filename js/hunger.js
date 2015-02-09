var conatiner = document.getElementById('container'),
  list        = d3.select('#list'),
  listHeader  = d3.select('#list-header'),
  togglers    = d3.selectAll('.nav a'),
  debug       = false,
  data, map, fills, activeTypes = ['Poverty'];

// container.style.height = container.offsetWidth / 2 + 'px';

fills = {
  Nutrition   : '#5BA68A',
  Poverty     : '#D9C45B',
  Productivity: '#D95829',
  Resilience  : '#D90404',
  Multiple    : '#59031A',
  defaultFill : '#ccc'
};

// d3.select(window).on('resize', function() {
//   map.resize();
// });
togglers.on('click', colorize);
if (debug) list.on('mousemove', highlightMap);


function highlightMap () {
  var iso = d3.select(event.target).attr('data-iso');

  map.svg.selectAll('path.hovered')
    .style('fill', function (d, i) { return d3.rgb(d3.select(this).style('fill')).brighter(.4)})
    .classed('hovered', false);

  if (iso) {
     map.svg.select('path.' + iso)
      .style('fill', function (d, i) { return d3.rgb(d3.select(this).style('fill')).darker(.4)})
      .classed('hovered', true);
  }
}

function colorize () {
  var type      = d3.select(this).attr('data-type'),
    activeIndex = activeTypes.indexOf(type);

  if (activeIndex === -1) {
    activeTypes.push(type);
  } else {
    activeTypes.splice(activeIndex, 1);
  }

  togglers
    .classed('active', false)
    .filter(function (d, i) {
      return activeTypes.indexOf(d3.select(this).attr('data-type')) > -1;
    })
    .classed('active', true);

  map.updateChoropleth(getColors(activeTypes));
  if (debug) listNames(activeTypes, getCount(activeTypes));
  event.preventDefault();
}

function getColors (types) {
  var colors = {},
    fillType = types.length === 1 ? types[0] : 'Multiple';

  data.forEach(function (d) {
    colors[d.iso3] = {fillKey: isSet(d, types) ? fillType : 'defaultFill'}
  });

  return colors;
}

function listNames (types, count) {
  var template = '';

  data.forEach(function (d) {
    if (isSet(d, types)) template += ('<span data-iso="' + d.iso3 + '">' + d.name + '</span>');
  });

  updateListHeader(types, count);

  list.html(template);
}

function updateListHeader (types, count) {
  var cType = count === 1 ? 'country' : 'countries',
    template = types.length ? count + ' ' + cType + ' with ' : '';

  types.forEach(function (type, index) {
    template += type;
    if (index < types.length - 2) template += ', ';
    if (index === types.length - 2) template += ' and ';
  });

  listHeader.html(template);
}

function getCount (types) {
  var counter = 0;

  data.forEach(function (d) {
    if (isSet(d, types)) counter++;
  });

  return counter;
}

function isSet (d, types) {
  var isSet = types.length ? true : false;
  for (var i = types.length - 1; i >= 0; i--) {
    isSet = d[types[i]];
    if (!isSet) break;
  };
  return isSet;
} 

d3.json('data/data.json', function (error, d) {
  data = d;
  map = new Datamap({
    responsive: true,
    projection: 'mercator',
    element: container,
    fills: fills,
    data: getColors(activeTypes)
  });

  if (debug) listNames(activeTypes, getCount(activeTypes));
});

