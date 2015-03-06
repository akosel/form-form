d3.select(window).on("resize", throttle);

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 9])
  .on("zoom", move);

var width = document.getElementById('container').offsetWidth;
var height = width / 2;
var topo,projection,path,svg,g;
var graticule = d3.geo.graticule();
var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

setup(width,height);

function setup(width,height){
  projection = d3.geo.mercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI);
  path = d3.geo.path().projection(projection);
  svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)
    .on("click", click)
    .append("g");
  g = svg.append("g");
}

d3.json("data/world-topo-min.json", function(error, world) {
  var countries = topojson.feature(world, world.objects.countries).features;
  d3.json('/vacations/summary', function(error, bundle) {
    countries.forEach(function(country) {
      country.properties.value = bundle[country.properties.name] || 0;
    });
    topo = countries;
    draw(topo);
  });
});

function draw(topo) {
  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);
  g.append("path")
    .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
    .attr("class", "equator")
    .attr("d", path);
  var country = g.selectAll(".country").data(topo);
  country.enter().insert("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("id", function(d,i) { return d.id; })
    .attr("title", function(d,i) { return d.properties.name; })
    .style("fill", function(d, i) { return d.properties.value > 0 ? '#e74c3c' : '#eee'; });
  //offsets for tooltips
  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;
  //tooltips
  country
    .on("mousemove", function(d,i) {
      var noun = d.properties.value === 1 ? 'traveler' : 'travelers';
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      tooltip.classed("hidden", false)
      .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
      .html([d.properties.name, ':', d.properties.value, noun].join(' '));
    })
    .on("mouseout",  function(d,i) {
      tooltip.classed("hidden", true);
    })
    .on("click", function(d, i) {
      console.log(d.properties.name);
    var app = [{
          title: 'Location. Location. Location.',
          description: 'Where do you want to go?',
          //bgColor: '#e67e22',
          validButtonText: 'NEXT: COSTS',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                placeholder: 'e.g. Timbuktu or Thailand',
                type: 'text',
                name: 'location',
                value: d.properties.name,
                required: true,
                places: true,
                autofocus: true
              },
              fn_print: function() {
                return 'Location: ' + this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
        }, {
          title: 'Timing is everything',
          description: 'Roughly speaking, when do you want to go and for how long?',
          //bgColor: '#1C6B7C',
          validButtonText: 'NEXT: REVIEW',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                type: 'date',
                min: [(new Date()).getFullYear(), ("0" + (new Date()).getMonth()).slice(-2), ("0" + (new Date()).getDate()).slice(-2)].join('-'),
                max: '2100-01-01',
                required: true,
                name: 'date',
                autofocus: true,
              },
              fn_print: function() {
                var date = new Date(this.attributes.value);
                return 'Around: ' + date.toLocaleDateString();
              },
              fn_dbFormat: function() {
                var date = new Date(this.attributes.value);
                return date;
              }
            },
            {
              tagName: 'select',
              modelName: 'vacation',
              attributes: {
                value: 'A week',
                name: 'duration'
              },
              options: [
                'A week',
                'Two Weeks',
                'Three Weeks',
                'A month',
                'A long, long time'
              ],
              fn_print: function() {
                return 'Duration: ' + this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
        }, {
          title: 'This is it.',
          description: 'Ok, after you review everything, enter your email below.',
          validButtonText: 'ALL DONE',
          showData: true,
          //bgColor: '#125E3B',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                placeholder: 'What is your email?',
                name: 'email',
                required: true,
                type: 'email',
                autofocus: true
              },
              fn_print: function() {
                return this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
    }];


    var form = new FormHandler({
      activeStep: 0,
      steps: app
    });
    });
  //EXAMPLE: adding some capitals from external CSV file
  d3.csv("data/country-capitals.csv", function(err, capitals) {
    capitals.forEach(function(i){
      addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName );
    });
  });
  addpoint(-83, 42, 'Ann Arbor');
}
function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo);
}
function move() {
  var t = d3.event.translate;
  var s = d3.event.scale;
  zscale = s;
  var h = height/4;
  t[0] = Math.min(
      (width/height)  * (s - 1),
      Math.max( width * (1 - s), t[0] )
      );
  t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(height  * (1 - s) - h * s, t[1])
      );
  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");
  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".country").style("stroke-width", 1.5 / s);
}

var throttleTimer;

function throttle() {
  window.clearTimeout(throttleTimer);
  throttleTimer = window.setTimeout(function() {
    redraw();
  }, 200);
}
//geo translation on mouse click in map
function click() {
  var latlon = projection.invert(d3.mouse(this));
  console.log(latlon);
}
//function to add points and text to the map (used in plotting capitals)
function addpoint(lat,lon,text) {
  var gpoint = g.append("g").attr("class", "gpoint");
  var x = projection([lat,lon])[0];
  var y = projection([lat,lon])[1];
  gpoint.append("svg:circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("class","point")
    .attr("r", 1.5);
  //conditional in case a point has no associated text
  if(text.length>0){
    gpoint.append("text")
      .attr("x", x+2)
      .attr("y", y+2)
      .attr("class","text")
      .text(text);
  }
}
