// helper functions
function createTooltip() {
  return d3.select('#viz').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #ccc')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
    .style('font-size', '12px');
}

// make line curve
function createLineGenerator(x, y) {
  return d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);
}

function animateLine(path, duration = 1000) {
  const totalLength = path.node().getTotalLength();
  path
    .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0);
}

function createInteractiveCircle(svg, data, x, y, color, radius = 4, tooltip, valueKey = 'value', className = 'interactive-circle') {
  return svg.selectAll(`circle.${className}`)
    .data(data)
    .enter().append('circle')
    .attr('class', className)
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d[valueKey]))
    .attr('r', radius)
    .attr('fill', color)
    .style('cursor', 'pointer')
    .style('transition', 'r 0.2s ease')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', radius * 1.5);
      
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      
      tooltip.html(tooltip.content(d))
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 10) + 'px')
             .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', radius);
      
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });
}

function createAxisWithTransitions(svg, x, y, width, height, margin) {
  // X axis with transition
  const xAxis = svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .style('opacity', 0);
  
  xAxis.transition()
    .duration(500)
    .style('opacity', 1);
  
  // Y axis with transition
  const yAxis = svg.append('g')
    .style('opacity', 0);
  
  yAxis.transition()
    .duration(500)
    .delay(200)
    .style('opacity', 1);
  
  return { xAxis, yAxis };
}

function createLegend(svg, legendData, plotWidth, margin) {
  const legend = svg.append('g')
    .attr('transform', `translate(${plotWidth + margin.right}, 10)`)
    .style('opacity', 0);
  
  legend.transition()
    .duration(500)
    .delay(400)
    .style('opacity', 1);
  
  legendData.forEach((item, i) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(0, ${i * 24})`);
    
    // Line
    legendItem.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 0).attr('y2', 0)
      .attr('stroke', item.color)
      .attr('stroke-width', item.strokeWidth || 3)
      .style('stroke-dasharray', item.dashArray || 'none');
    
    // Text
    legendItem.append('text')
      .attr('x', 36).attr('y', 4)
      .text(item.label)
      .attr('fill', '#333')
      .attr('font-size', '1em');
  });
  
  // Legend title
  legend.append('text')
    .attr('x', 0).attr('y', -10)
    .text('Legend:')
    .attr('font-weight', 'bold')
    .attr('fill', '#333');
}

function createAnnotation(svg, x, y, text, color = '#1976d2', opacity = 0.08) {
  return svg.append('rect')
    .attr('x', x.start)
    .attr('y', 0)
    .attr('width', x.end - x.start)
    .attr('height', y)
    .attr('fill', color)
    .attr('opacity', 0)
    .transition()
    .duration(800)
    .delay(600)
    .attr('opacity', opacity);
}

function createAnnotationText(svg, x, y, text, color = '#1976d2') {
  return svg.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', 'middle')
    .attr('fill', color)
    .attr('font-size', '1em')
    .attr('font-weight', 'bold')
    .style('opacity', 0)
    .text(text)
    .transition()
    .duration(800)
    .delay(800)
    .style('opacity', 1);
}

// Scene transition helper
function transitionToScene(newScene) {
  d3.select('#viz')
    .transition()
    .duration(300)
    .style('opacity', 0)
    .end()
    .then(() => {
      d3.select('#viz').html('');
      d3.select('#annotation').html('');
      newScene();
      d3.select('#viz')
        .transition()
        .duration(300)
        .style('opacity', 1);
    });
}

let currentScene = 0;
const scenes = [showScene1, showScene2, showScene3, showScene4, showScene5, showScene6];

function updateProgress() {
  document.getElementById('progress').textContent = `Slide ${currentScene + 1} of ${scenes.length}`;
  document.getElementById('prevBtn').disabled = currentScene === 0;
  document.getElementById('nextBtn').disabled = currentScene === scenes.length - 1;
}

function nextScene() {
  if (currentScene < scenes.length - 1) {
    currentScene++;
    transitionToScene(scenes[currentScene]);
    updateProgress();
  }
}

function prevScene() {
  if (currentScene > 0) {
    currentScene--;
    transitionToScene(scenes[currentScene]);
    updateProgress();
  }
}

document.getElementById('nextBtn').onclick = nextScene;
document.getElementById('prevBtn').onclick = prevScene;

function renderScene() {
  d3.select('#viz').html('');
  d3.select('#annotation').html('');
  scenes[currentScene]();
  updateProgress();
}


function showScene1() {
  const margin = {top: 40, right: 30, bottom: 50, left: 60};
  const width = 760 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#viz').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  d3.csv('data/league_stats.csv').then(data => {
    // filter for 1979-80 onward and valid 3pa
    const filtered = data.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      return year >= 1980 && d['3PA'] != null && d['3PA'] !== '';
    });

    // scales
    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.year))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d['3PA']) * 1.1])
      .range([height, 0]);

    // create axes with transitions
    const { xAxis, yAxis } = createAxisWithTransitions(svg, x, y, width, height, margin);
    
    xAxis.call(d3.axisBottom(x).tickFormat(d3.format('d')));
    yAxis.call(d3.axisLeft(y));

    // axis labels with transitions
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('opacity', 0)
      .text('Season')
      .transition()
      .duration(500)
      .delay(300)
      .style('opacity', 1);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('opacity', 0)
      .text('3PA per Game')
      .transition()
      .duration(500)
      .delay(300)
      .style('opacity', 1);

    // prepare data for line
    const lineData = filtered.map(d => ({ year: d.year, value: d['3PA'] }));

    // create line with animation
    const line = createLineGenerator(x, y);
    const path = svg.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // animate the line
    animateLine(path, 1500);

    // create tooltip
    const tooltip = createTooltip();
    tooltip.content = (d) => {
      const originalData = filtered.find(item => item.year === d.year);
      return `<strong>${originalData.Season}</strong><br>3PA: ${originalData['3PA'].toFixed(1)}<br>3P%: ${originalData['3P%'] ? (originalData['3P%']*100).toFixed(1)+'%' : 'N/A'}`;
    };

    // create interactive circles
    createInteractiveCircle(svg, lineData, x, y, '#ffb300', 4, tooltip, 'value', 'scene1-circles');

    // annotations with transitions
    const annotations = [
      {
        note: { label: '3-point line introduced', align: 'middle' },
        data: filtered.find(d => d.Season === '1979-80'),
        dy: -60, dx: 0
      },
      {
        note: { label: 'Line shortened (1994-97)', align: 'left' },
        data: filtered.find(d => d.Season === '1994-95'),
        dy: -40, dx: 40
      },
      {
        note: { label: '3-point boom (2015+)', align: 'right' },
        data: filtered.find(d => d.Season === '2015-16'),
        dy: -50, dx: 60
      }
    ].filter(a => a.data);

    // add annotations with delays
    annotations.forEach((annotation, i) => {
      setTimeout(() => {
        const makeAnnotations = d3.annotation()
          .type(d3.annotationLabel)
          .accessors({
            x: d => x(d.year),
            y: d => y(d['3PA'])
          })
          .annotations([{
            note: annotation.note,
            x: x(annotation.data.year),
            y: y(annotation.data['3PA']),
            dx: annotation.dx,
            dy: annotation.dy
          }]);
        
        svg.append('g')
          .style('opacity', 0)
          .call(makeAnnotations)
          .transition()
          .duration(500)
          .style('opacity', 1);
      }, 1000 + (i * 300));
    });

    // title with transition
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .style('opacity', 0)
      .text('NBA League Average 3-Point Attempts per Game (1980–Present)')
      .transition()
      .duration(500)
      .delay(100)
      .style('opacity', 1);
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .style('opacity', 0)
    .html('The NBA introduced the 3-point line in 1979-80. Since then, 3-point attempts have steadily increased, with major jumps in the mid-1990s and the 2010s. Hover over points for details.')
    .transition()
    .duration(500)
    .delay(800)
    .style('opacity', 1);
}
function showScene2() {
  const plotWidth = 760;
  const margin = {top: 40, right: 120, bottom: 50, left: 60};
  const width = plotWidth;
  const height = 400 - margin.top - margin.bottom;
  const svgWidth = plotWidth + margin.left + margin.right + 200;

  const svg = d3.select('#viz').append('svg')
    .attr('width', svgWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  d3.csv('data/league_stats.csv').then(data => {
    // filter for 1990-2000
    const filtered = data.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['2PA'] = +d['FGA'] - +d['3PA'];
      return year >= 1990 && year <= 2000 && d['3PA'] != null && d['3P%'] != null && d['2PA'] != null;
    });

    // scales
    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.year))
      .range([0, plotWidth]);
    
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => Math.max(d['3PA'], d['2PA'])) * 1.1])
      .range([height, 0]);
    
    const yRight = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d['3P%']) * 1.15])
      .range([height, 0]);

    // create axes with transitions
    const { xAxis, yAxis } = createAxisWithTransitions(svg, x, yLeft, width, height, margin);
    
    xAxis.call(d3.axisBottom(x).tickValues([1990, 1992, 1994, 1996, 1998, 2000]).tickFormat(d3.format('d')));
    yAxis.call(d3.axisLeft(yLeft));

    // right y axis
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .style('opacity', 0)
      .call(d3.axisRight(yRight).tickFormat(d3.format('.0%')))
      .transition()
      .duration(500)
      .delay(300)
      .style('opacity', 1);

    // axis labels with transitions
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('opacity', 0)
      .text('Season')
      .transition()
      .duration(500)
      .delay(400)
      .style('opacity', 1);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('opacity', 0)
      .text('Attempts per Game (Left Axis)')
      .transition()
      .duration(500)
      .delay(400)
      .style('opacity', 1);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', width + margin.right - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('opacity', 0)
      .text('3P% (Right Axis)')
      .transition()
      .duration(500)
      .delay(400)
      .style('opacity', 1);

    // prepare data for lines
    const line3PAData = filtered.map(d => ({ year: d.year, value: d['3PA'] }));
    const line2PAData = filtered.map(d => ({ year: d.year, value: d['2PA'] }));
    const line3PpctData = filtered.map(d => ({ year: d.year, value: d['3P%'] }));

    // create lines with animations
    const line3PA = createLineGenerator(x, yLeft);
    const line2PA = createLineGenerator(x, yLeft);
    const line3Ppct = createLineGenerator(x, yRight);

    // draw lines with staggered animations
    const path3PA = svg.append('path')
      .datum(line3PAData)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2.5)
      .attr('d', line3PA);

    const path2PA = svg.append('path')
      .datum(line2PAData)
      .attr('fill', 'none')
      .attr('stroke', '#43a047')
      .attr('stroke-width', 2.5)
      .attr('d', line2PA);

    const path3Ppct = svg.append('path')
      .datum(line3PpctData)
      .attr('fill', 'none')
      .attr('stroke', '#ffb300')
      .attr('stroke-width', 2.5)
      .style('stroke-dasharray', '5 3')
      .attr('d', line3Ppct);

    // animate lines with delays
    setTimeout(() => animateLine(path3PA, 1000), 500);
    setTimeout(() => animateLine(path2PA, 1000), 1000);
    setTimeout(() => animateLine(path3Ppct, 1000), 1500);

    // create annotation with transition
    createAnnotation(svg, { start: x(1994), end: x(1997) }, height, '3PT Line Shortened', '#ffb300');
    createAnnotationText(svg, x(1994) + (x(1997) - x(1994))/2, 30, '3PT Line Shortened', '#ffb300');

    // create interactive circles with different colors and proper tooltips
    setTimeout(() => {
      const tooltip3PA = createTooltip();
      tooltip3PA.content = (d) => {
        const originalData = filtered.find(item => item.year === d.year);
        return `<strong>${originalData.Season}</strong><br>3PA: ${originalData['3PA'].toFixed(1)}`;
      };
      createInteractiveCircle(svg, line3PAData, x, yLeft, '#1976d2', 5, tooltip3PA, 'value', 'scene2-3pa-circles');
    }, 1000);
    
    setTimeout(() => {
      const tooltip2PA = createTooltip();
      tooltip2PA.content = (d) => {
        const originalData = filtered.find(item => item.year === d.year);
        return `<strong>${originalData.Season}</strong><br>2PA: ${originalData['2PA'].toFixed(1)}`;
      };
      createInteractiveCircle(svg, line2PAData, x, yLeft, '#43a047', 5, tooltip2PA, 'value', 'scene2-2pa-circles');
    }, 1100);
    
    setTimeout(() => {
      const tooltip3Ppct = createTooltip();
      tooltip3Ppct.content = (d) => {
        const originalData = filtered.find(item => item.year === d.year);
        return `<strong>${originalData.Season}</strong><br>3P%: ${(originalData['3P%']*100).toFixed(1)}%`;
      };
      createInteractiveCircle(svg, line3PpctData, x, yRight, '#ffb300', 5, tooltip3Ppct, 'value', 'scene2-3ppct-circles');
    }, 1200);

    // create legend with transitions
    const legendData = [
      { color: '#1976d2', label: '3PA (Left Axis)' },
      { color: '#43a047', label: '2PA (Left Axis)' },
      { color: '#ffb300', label: '3P% (Right Axis)', dashArray: '5 3' }
    ];

    setTimeout(() => createLegend(svg, legendData, plotWidth, margin), 3500);

    // title with transition
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .style('opacity', 0)
      .text('NBA 3PA, 2PA, and 3P% (1990–2000)')
      .transition()
      .duration(500)
      .delay(100)
      .style('opacity', 1);
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .style('opacity', 0)
    .html('From 1994–1997, the NBA shortened the 3-point line to encourage more attempts. This chart compares 3PA, 2PA, and 3P% during the 1990s. Hover over points for details.')
    .transition()
    .duration(500)
    .delay(800)
    .style('opacity', 1);
}
function showScene3() {
  const plotWidth = 760;
  const margin = {top: 40, right: 120, bottom: 50, left: 60};
  const width = plotWidth;
  const height = 400 - margin.top - margin.bottom;
  const svgWidth = plotWidth + margin.left + margin.right + 300;

  const svg = d3.select('#viz').append('svg')
    .attr('width', svgWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  Promise.all([
    d3.csv('data/suns_pergame.csv'),
    d3.csv('data/league_stats.csv')
  ]).then(([sunsData, leagueData]) => {
    // suns: filter for 2000–2010
    const suns = sunsData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['MP'] = +d['MP'];
      return year >= 2000 && year <= 2010 && d['3PA'] != null && d['3P%'] != null && d['MP'] != null;
    });
    // league: filter for 2000–2010
    const league = leagueData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      return year >= 2000 && year <= 2010 && d['3PA'] != null;
    });
    // map league by year for tooltip
    const leagueByYear = {};
    league.forEach(d => { leagueByYear[d.year] = d; });

    // X scale
    const x = d3.scaleLinear()
      .domain(d3.extent(suns, d => d.year))
      .range([0, plotWidth]);
    // Y scale for 3PA
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max([...suns, ...league], d => d['3PA']) * 1.1])
      .range([height, 0]);
    // Y scale for 3P%
    const yRight = d3.scaleLinear()
      .domain([
        d3.min(suns, d => d['3P%']) * 0.95, // Start at 95% of min value
        d3.max(suns, d => d['3P%']) * 1.05  // End at 105% of max value
      ])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues([2000, 2002, 2004, 2006, 2008, 2010]).tickFormat(d3.format('d')));
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('Season');

    // Y axis left
    svg.append('g')
      .call(d3.axisLeft(yLeft));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3PA (Left Axis)');

    // Y axis right
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yRight).tickFormat(d3.format('.0%')));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', width + margin.right - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3P% (Right Axis)');

    // Line generators
    const lineSuns3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const lineLeague3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const line3Ppct = d3.line()
      .x(d => x(d.year))
      .y(d => yRight(d['3P%']));

    // Draw lines
    svg.append('path')
      .datum(suns)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2.5)
      .attr('d', lineSuns3PA);
    svg.append('path')
      .datum(league)
      .attr('fill', 'none')
      .attr('stroke', '#888888') // Changed to gray
      .attr('stroke-width', 2.5)
      .attr('d', lineLeague3PA);
    svg.append('path')
      .datum(suns)
      .attr('fill', 'none')
      .attr('stroke', '#ffb300')
      .attr('stroke-width', 2.5)
      .style('stroke-dasharray', '5 3')
      .attr('d', line3Ppct);


    // Annotation for 2004–2010 (7 seconds or less) - moved before tooltip circles
    svg.append('rect')
      .attr('x', x(2004))
      .attr('y', 0)
      .attr('width', x(2010) - x(2004))
      .attr('height', height)
      .attr('fill', '#1976d2')
      .attr('opacity', 0.08);
    svg.append('text')
      .attr('x', x(2004) + (x(2010) - x(2004))/2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1976d2')
      .attr('font-size', '1em')
      .attr('font-weight', 'bold')
      .text('7 Seconds or Less Era');

    // Tooltip
    const tooltip = d3.select('#viz').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Circles for tooltips (Suns 3PA)
    svg.selectAll('circle.pa3')
      .data(suns)
      .enter().append('circle')
      .attr('class', 'pa3')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#1976d2')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>Suns 3PA: ${d['3PA'].toFixed(1)}<br>MP: ${d['MP'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (League 3PA)
    svg.selectAll('circle.lg3pa')
      .data(league)
      .enter().append('circle')
      .attr('class', 'lg3pa')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#888888') // Changed to gray
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>League Avg 3PA: ${d['3PA'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (3P%)
    svg.selectAll('circle.pct3')
      .data(suns)
      .enter().append('circle')
      .attr('class', 'pct3')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yRight(d['3P%']))
      .attr('r', 4)
      .attr('fill', '#ffb300')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>3P%: ${(d['3P%']*100).toFixed(1)}%<br>MP: ${d['MP'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // Legend (with lines)
    const legend = svg.append('g')
      .attr('transform', `translate(${plotWidth + 150}, 10)`);
    // Suns 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 0).attr('y2', 0)
      .attr('stroke', '#1976d2').attr('stroke-width', 3);
    legend.append('text')
      .attr('x', 36).attr('y', 4)
      .text('Suns 3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // League 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 24).attr('y2', 24)
      .attr('stroke', '#888888').attr('stroke-width', 3); // Changed to gray, solid line
    legend.append('text')
      .attr('x', 36).attr('y', 28)
      .text('League Avg 3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // 3P%
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 48).attr('y2', 48)
      .attr('stroke', '#ffb300').attr('stroke-width', 3)
      .style('stroke-dasharray', '5 3');
    legend.append('text')
      .attr('x', 36).attr('y', 52)
      .text('Suns 3P% (Right Axis)').attr('fill', '#333').attr('font-size', '1em');
    legend.append('text')
      .attr('x', 0).attr('y', -10)
      .text('Legend:').attr('font-weight', 'bold').attr('fill', '#333');

    // Title
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('Phoenix Suns vs. League: 3PA and 3P% (2000–2010)');
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('From 2004-2010, the Suns popularized the "7 seconds or less" offense, playing at a fast pace and shooting more threes. This chart compares Suns 3PA, league average 3PA, and Suns 3P%. Hover over points for details. Minutes played (MP) is shown in the tooltip for Suns.');
}
function showScene4() {
  const plotWidth = 760;
  const margin = {top: 40, right: 120, bottom: 50, left: 60};
  const width = plotWidth;
  const height = 400 - margin.top - margin.bottom;
  const svgWidth = plotWidth + margin.left + margin.right + 400; // Increased from 300 to 400

  const svg = d3.select('#viz').append('svg')
    .attr('width', svgWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  Promise.all([
    d3.csv('data/warriors_pergame.csv'),
    d3.csv('data/rockets_pergame.csv'),
    d3.csv('data/league_stats.csv')
  ]).then(([warriorsData, rocketsData, leagueData]) => {
    // Warriors: Filter for 2015–2020
    const warriors = warriorsData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      return year >= 2015 && year <= 2020 && d['3PA'] != null && d['3P%'] != null;
    });
    // Rockets: Filter for 2015–2020
    const rockets = rocketsData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      return year >= 2015 && year <= 2020 && d['3PA'] != null && d['3P%'] != null;
    });
    // League: Filter for 2015–2020
    const league = leagueData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null; // Add 3P% for league
      return year >= 2015 && year <= 2020 && d['3PA'] != null && d['3P%'] != null;
    });

    // X scale
    const x = d3.scaleLinear()
      .domain(d3.extent(warriors, d => d.year))
      .range([0, plotWidth]);
    // Y scale for 3PA
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max([...warriors, ...rockets, ...league], d => d['3PA']) * 1.2]) // Increased from 1.1 to 1.2
      .range([height, 0]);
    // Y scale for 3P%
    const yRight = d3.scaleLinear()
      .domain([
        d3.min([...warriors, ...rockets, ...league], d => d['3P%']) * 0.95, // Start at 95% of min value
        d3.max([...warriors, ...rockets, ...league], d => d['3P%']) * 1.15  // End at 115% of max value
      ])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues([2015, 2016, 2017, 2018, 2019, 2020]).tickFormat(d3.format('d')));
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('Season');

    // Y axis left
    svg.append('g')
      .call(d3.axisLeft(yLeft));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3PA (Left Axis)');

    // Y axis right
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yRight).tickFormat(d3.format('.0%')));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', width + margin.right - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3P% (Right Axis)');

    // Line generators
    const lineWarriors3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const lineRockets3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const lineLeague3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const lineWarriors3Ppct = d3.line()
      .x(d => x(d.year))
      .y(d => yRight(d['3P%']));
    const lineRockets3Ppct = d3.line()
      .x(d => x(d.year))
      .y(d => yRight(d['3P%']));
    const lineLeague3Ppct = d3.line() // Add league 3P% line generator
      .x(d => x(d.year))
      .y(d => yRight(d['3P%']));

    // Draw lines
    svg.append('path')
      .datum(warriors)
      .attr('fill', 'none')
      .attr('stroke', '#4285F4') // Changed to blue
      .attr('stroke-width', 2.5)
      .attr('d', lineWarriors3PA);
    svg.append('path')
      .datum(rockets)
      .attr('fill', 'none')
      .attr('stroke', '#DB4437') // Changed to red
      .attr('stroke-width', 2.5)
      .attr('d', lineRockets3PA);
    svg.append('path')
      .datum(league)
      .attr('fill', 'none')
      .attr('stroke', '#888888') // Changed to gray
      .attr('stroke-width', 2.5)
      .attr('d', lineLeague3PA);
    svg.append('path')
      .datum(warriors)
      .attr('fill', 'none')
      .attr('stroke', '#4285F4') // Changed to blue
      .attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3')
      .attr('d', lineWarriors3Ppct);
    svg.append('path')
      .datum(rockets)
      .attr('fill', 'none')
      .attr('stroke', '#DB4437') // Changed to red
      .attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3')
      .attr('d', lineRockets3Ppct);
    svg.append('path') // Add league 3P% line
      .datum(league)
      .attr('fill', 'none')
      .attr('stroke', '#888888') // Changed to gray
      .attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3')
      .attr('d', lineLeague3Ppct);

    // Annotation for 2015–2020 (3-point revolution) - moved before tooltip circles
    svg.append('rect')
      .attr('x', x(2015))
      .attr('y', 0)
      .attr('width', x(2020) - x(2015))
      .attr('height', height)
      .attr('fill', '#4285F4') // Changed to blue
      .attr('opacity', 0.08);
    svg.append('text')
      .attr('x', x(2015) + (x(2020) - x(2015))/2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#4285F4') // Changed to blue
      .attr('font-size', '0.9em') // Reduced from 1em to 0.9em
      .attr('font-weight', 'bold')
      .text('3-Point Revolution Era');

    // Tooltip
    const tooltip = d3.select('#viz').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Circles for tooltips (Warriors 3PA)
    svg.selectAll('circle.warriors3pa')
      .data(warriors)
      .enter().append('circle')
      .attr('class', 'warriors3pa')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#4285F4') // Changed to blue
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>Warriors 3PA: ${d['3PA'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (Rockets 3PA)
    svg.selectAll('circle.rockets3pa')
      .data(rockets)
      .enter().append('circle')
      .attr('class', 'rockets3pa')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#DB4437') // Changed to red
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>Rockets 3PA: ${d['3PA'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (League 3PA)
    svg.selectAll('circle.league3pa')
      .data(league)
      .enter().append('circle')
      .attr('class', 'league3pa')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#888888') // Changed to gray
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>League Avg 3PA: ${d['3PA'].toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (Warriors 3P%)
    svg.selectAll('circle.warriors3ppct')
      .data(warriors)
      .enter().append('circle')
      .attr('class', 'warriors3ppct')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yRight(d['3P%']))
      .attr('r', 4)
      .attr('fill', '#4285F4') // Changed to blue
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>Warriors 3P%: ${(d['3P%']*100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (Rockets 3P%)
    svg.selectAll('circle.rockets3ppct')
      .data(rockets)
      .enter().append('circle')
      .attr('class', 'rockets3ppct')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yRight(d['3P%']))
      .attr('r', 4)
      .attr('fill', '#DB4437') // Changed to red
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>Rockets 3P%: ${(d['3P%']*100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (League 3P%)
    svg.selectAll('circle.league3ppct')
      .data(league)
      .enter().append('circle')
      .attr('class', 'league3ppct')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yRight(d['3P%']))
      .attr('r', 4)
      .attr('fill', '#888888') // Changed to gray
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>League Avg 3P%: ${(d['3P%']*100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // Legend (with lines) - moved much further right
    const legend = svg.append('g')
      .attr('transform', `translate(${plotWidth + 180}, 10)`); // Moved from 120 to 180
    // Warriors 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 0).attr('y2', 0)
      .attr('stroke', '#4285F4').attr('stroke-width', 3); // Changed to blue
    legend.append('text')
      .attr('x', 36).attr('y', 4)
      .text('Warriors 3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // Rockets 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 24).attr('y2', 24)
      .attr('stroke', '#DB4437').attr('stroke-width', 3); // Changed to red
    legend.append('text')
      .attr('x', 36).attr('y', 28)
      .text('Rockets 3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // League 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 48).attr('y2', 48)
      .attr('stroke', '#888888').attr('stroke-width', 3); // Changed to gray, solid line
    legend.append('text')
      .attr('x', 36).attr('y', 52)
      .text('League Avg 3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // Warriors 3P%
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 72).attr('y2', 72)
      .attr('stroke', '#4285F4').attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3'); // Changed to blue, keep dashed
    legend.append('text')
      .attr('x', 36).attr('y', 76)
      .text('Warriors 3P% (Right Axis)').attr('fill', '#333').attr('font-size', '1em');
    // Rockets 3P%
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 96).attr('y2', 96)
      .attr('stroke', '#DB4437').attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3'); // Changed to red, keep dashed
    legend.append('text')
      .attr('x', 36).attr('y', 100)
      .text('Rockets 3P% (Right Axis)').attr('fill', '#333').attr('font-size', '1em');
    // League 3P% - Add this new entry
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 120).attr('y2', 120)
      .attr('stroke', '#888888').attr('stroke-width', 2)
      .style('stroke-dasharray', '5 3'); // Changed to gray, keep dashed
    legend.append('text')
      .attr('x', 36).attr('y', 124)
      .text('League Avg 3P% (Right Axis)').attr('fill', '#333').attr('font-size', '1em');
    legend.append('text')
      .attr('x', 0).attr('y', -10)
      .text('Legend:').attr('font-weight', 'bold').attr('fill', '#333');

    // Title
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('Warriors & Rockets vs. League: 3PA and 3P% (2015–2020)');
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('From 2015–2020, the Warriors and Rockets led the 3-point revolution. The Warriors won championships with their "Splash Brothers" backcourt, while the Rockets pioneered "Moreyball" with high-volume 3-point shooting. Both teams consistently shot more threes than the league average. Hover over points for details.');
}
function showScene5() {
  const plotWidth = 760;
  const margin = {top: 40, right: 120, bottom: 50, left: 60};
  const width = plotWidth;
  const height = 400 - margin.top - margin.bottom;
  const svgWidth = plotWidth + margin.left + margin.right + 300;

  const svg = d3.select('#viz').append('svg')
    .attr('width', svgWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  d3.csv('data/league_stats.csv').then(data => {
    // Filter for 2020–Present (main data)
    const filtered = data.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['2PA'] = +d['FGA'] - +d['3PA'];
      return year >= 2020 && d['3PA'] != null && d['3P%'] != null && d['2PA'] != null;
    });

    // Filter for 2000-2004 (reference data)
    const referenceData = data.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['2PA'] = +d['FGA'] - +d['3PA'];
      return year >= 2000 && year <= 2004 && d['3PA'] != null && d['3P%'] != null && d['2PA'] != null;
    });

    // X scale (2020-2024)
    const x = d3.scaleLinear()
      .domain([2020, 2024])
      .range([0, plotWidth]);
    
    // Y scale for attempts
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max([...filtered, ...referenceData], d => Math.max(d['3PA'], d['2PA'])) * 1.1])
      .range([height, 0]);
    
    // Y scale for 3P%
    const yRight = d3.scaleLinear()
      .domain([0, d3.max([...filtered, ...referenceData], d => d['3P%']) * 1.15])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues([2020, 2021, 2022, 2023, 2024]).tickFormat(d3.format('d')));
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('Season');

    // Y axis left
    svg.append('g')
      .call(d3.axisLeft(yLeft));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('Attempts per Game (Left Axis)');

    // Y axis right
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yRight).tickFormat(d3.format('.0%')));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', width + margin.right - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3P% (Right Axis)');

    // Line generators
    const line3PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['3PA']));
    const line2PA = d3.line()
      .x(d => x(d.year))
      .y(d => yLeft(d['2PA']));
    const line3Ppct = d3.line()
      .x(d => x(d.year))
      .y(d => yRight(d['3P%']));

    // Draw reference lines (2000-2004) - horizontal lines at average values
    const avg3PA2000s = d3.mean(referenceData, d => d['3PA']);
    const avg2PA2000s = d3.mean(referenceData, d => d['2PA']);
    const avg3Ppct2000s = d3.mean(referenceData, d => d['3P%']);

    // Reference lines
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', plotWidth)
      .attr('y1', yLeft(avg3PA2000s))
      .attr('y2', yLeft(avg3PA2000s))
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '10 5')
      .attr('opacity', 0.6);

    svg.append('line')
      .attr('x1', 0)
      .attr('x2', plotWidth)
      .attr('y1', yLeft(avg2PA2000s))
      .attr('y2', yLeft(avg2PA2000s))
      .attr('stroke', '#43a047')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '10 5')
      .attr('opacity', 0.6);

    svg.append('line')
      .attr('x1', 0)
      .attr('x2', plotWidth)
      .attr('y1', yRight(avg3Ppct2000s))
      .attr('y2', yRight(avg3Ppct2000s))
      .attr('stroke', '#ffb300')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '10 5')
      .attr('opacity', 0.6);

    // Add labels for reference lines
    svg.append('text')
      .attr('x', plotWidth + 10)
      .attr('y', yLeft(avg3PA2000s) + 4)
      .attr('text-anchor', 'start')
      .attr('font-size', '0.75em')
      .attr('fill', '#1976d2')
      .attr('font-weight', 'bold')
      .text(`2000-2004 Avg 3PA: ${avg3PA2000s.toFixed(1)}`);

    svg.append('text')
      .attr('x', plotWidth + 10)
      .attr('y', yLeft(avg2PA2000s) + 4)
      .attr('text-anchor', 'start')
      .attr('font-size', '0.75em')
      .attr('fill', '#43a047')
      .attr('font-weight', 'bold')
      .text(`2000-2004 Avg 2PA: ${avg2PA2000s.toFixed(1)}`);

    svg.append('text')
      .attr('x', plotWidth + 10)
      .attr('y', yRight(avg3Ppct2000s) + 4)
      .attr('text-anchor', 'start')
      .attr('font-size', '0.75em')
      .attr('fill', '#ffb300')
      .attr('font-weight', 'bold')
      .text(`2000-2004 Avg 3P%: ${(avg3Ppct2000s*100).toFixed(1)}%`);

    // Draw main lines (2020-2024)
    svg.append('path')
      .datum(filtered)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2.5)
      .attr('d', line3PA);
    svg.append('path')
      .datum(filtered)
      .attr('fill', 'none')
      .attr('stroke', '#43a047')
      .attr('stroke-width', 2.5)
      .attr('d', line2PA);
    svg.append('path')
      .datum(filtered)
      .attr('fill', 'none')
      .attr('stroke', '#ffb300')
      .attr('stroke-width', 2.5)
      .style('stroke-dasharray', '5 3')
      .attr('d', line3Ppct);

    // Annotation for 2020–Present (3-point boom) - moved before tooltip circles
    svg.append('rect')
      .attr('x', x(2020))
      .attr('y', 0)
      .attr('width', x(2024) - x(2020))
      .attr('height', height)
      .attr('fill', '#1976d2')
      .attr('opacity', 0.08);
    svg.append('text')
      .attr('x', x(2020) + (x(2024) - x(2020))/2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1976d2')
      .attr('font-size', '1em')
      .attr('font-weight', 'bold')
      .text('3-Point Boom Era');

    // Tooltip
    const tooltip = d3.select('#viz').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Circles for tooltips (3PA)
    svg.selectAll('circle.pa3')
      .data(filtered)
      .enter().append('circle')
      .attr('class', 'pa3')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#1976d2')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>3PA: ${d['3PA'].toFixed(1)}<br>2000-2004 Avg: ${avg3PA2000s.toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (2PA)
    svg.selectAll('circle.pa2')
      .data(filtered)
      .enter().append('circle')
      .attr('class', 'pa2')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yLeft(d['2PA']))
      .attr('r', 4)
      .attr('fill', '#43a047')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>2PA: ${d['2PA'].toFixed(1)}<br>2000-2004 Avg: ${avg2PA2000s.toFixed(1)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    // Circles for tooltips (3P%)
    svg.selectAll('circle.pct3')
      .data(filtered)
      .enter().append('circle')
      .attr('class', 'pct3')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yRight(d['3P%']))
      .attr('r', 4)
      .attr('fill', '#ffb300')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>3P%: ${(d['3P%']*100).toFixed(1)}%<br>2000-2004 Avg: ${(avg3Ppct2000s*100).toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // Legend (with lines)
    const legend = svg.append('g')
      .attr('transform', `translate(${plotWidth + 200}, 10)`);
    // 3PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 0).attr('y2', 0)
      .attr('stroke', '#1976d2').attr('stroke-width', 3);
    legend.append('text')
      .attr('x', 36).attr('y', 4)
      .text('3PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // 2PA
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 24).attr('y2', 24)
      .attr('stroke', '#43a047').attr('stroke-width', 3);
    legend.append('text')
      .attr('x', 36).attr('y', 28)
      .text('2PA (Left Axis)').attr('fill', '#333').attr('font-size', '1em');
    // 3P%
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 48).attr('y2', 48)
      .attr('stroke', '#ffb300').attr('stroke-width', 3)
      .style('stroke-dasharray', '5 3');
    legend.append('text')
      .attr('x', 36).attr('y', 52)
      .text('3P% (Right Axis)').attr('fill', '#333').attr('font-size', '1em');
    // Reference lines - individual entries
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 72).attr('y2', 72)
      .attr('stroke', '#1976d2').attr('stroke-width', 1.5)
      .style('stroke-dasharray', '10 5');
    legend.append('text')
      .attr('x', 36).attr('y', 76)
      .text('2000-2004 Avg 3PA').attr('fill', '#333').attr('font-size', '1em');
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 96).attr('y2', 96)
      .attr('stroke', '#43a047').attr('stroke-width', 1.5)
      .style('stroke-dasharray', '10 5');
    legend.append('text')
      .attr('x', 36).attr('y', 100)
      .text('2000-2004 Avg 2PA').attr('fill', '#333').attr('font-size', '1em');
    legend.append('line')
      .attr('x1', 0).attr('x2', 30).attr('y1', 120).attr('y2', 120)
      .attr('stroke', '#ffb300').attr('stroke-width', 1.5)
      .style('stroke-dasharray', '10 5');
    legend.append('text')
      .attr('x', 36).attr('y', 124)
      .text('2000-2004 Avg 3P%').attr('fill', '#333').attr('font-size', '1em');
    legend.append('text')
      .attr('x', 0).attr('y', -10)
      .text('Legend:').attr('font-weight', 'bold').attr('fill', '#333');

    // Title
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('NBA 3-Point Boom: 2020–Present (vs. 2000-2004 Reference)');
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('This chart shows the 3-point boom from 2020-2024 with horizontal reference lines showing the average values from 2000-2004. The dramatic increase in 3PA and decrease in 2PA demonstrates how the game has fundamentally changed. Hover over points to see current values compared to the 2000-2004 averages.');
}
function showScene6() {
  const margin = {top: 20, right: 20, bottom: 120, left: 60}; // Increased bottom margin from 80 to 120
  const width = 900 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom; // Increased height from 400 to 450

  // Create main container for the dashboard
  const dashboard = d3.select('#viz')
    .append('div')
    .style('display', 'grid')
    .style('grid-template-columns', '1fr 1fr')
    .style('grid-template-rows', 'auto auto')
    .style('gap', '20px')
    .style('padding', '20px');

  // Panel 1: Top 10 3PT Shooters
  const panel1 = dashboard.append('div')
    .style('grid-column', '1')
    .style('grid-row', '1')
    .style('background', '#f8f9fa')
    .style('border-radius', '8px')
    .style('padding', '15px')
    .style('border', '1px solid #dee2e6');

  panel1.append('h3')
    .text('Top 10 3PT Shooters')
    .style('margin', '0 0 15px 0')
    .style('color', '#333')
    .style('font-size', '1.2em');

  // Panel 2: Top 3PT Teams by Year
  const panel2 = dashboard.append('div')
    .style('grid-column', '2')
    .style('grid-row', '1')
    .style('background', '#f8f9fa')
    .style('border-radius', '8px')
    .style('padding', '15px')
    .style('border', '1px solid #dee2e6');

  panel2.append('h3')
    .text('Top 3PT Shooting Teams (2020-Present)')
    .style('margin', '0 0 15px 0')
    .style('color', '#333')
    .style('font-size', '1.2em');

  // Add sort selector for teams
  const teamSortSelector = panel2.append('div')
    .style('margin-bottom', '15px');

  teamSortSelector.append('label')
    .text('Sort by: ')
    .style('margin-right', '10px')
    .style('font-weight', 'bold');

  const teamSortSelect = teamSortSelector.append('select')
    .style('padding', '5px')
    .style('border-radius', '4px')
    .style('border', '1px solid #ccc');

  const teamSortOptions = [
    {value: '3PA', label: '3PA (Volume)'},
    {value: '3P%', label: '3P% (Accuracy)'},
    {value: '3PM', label: '3PM (Makes)'}
  ];

  teamSortSelect.selectAll('option')
    .data(teamSortOptions)
    .enter().append('option')
    .attr('value', d => d.value)
    .text(d => d.label)
    .property('selected', d => d.value === '3PA');

  // Load data for all panels
  Promise.all([
    d3.csv('data/Team_Stats_Per_Game.csv'),
    d3.csv('data/league_stats.csv'),
    d3.csv('data/Player_Shooting.csv'),
    d3.csv('data/Player_Per_Game.csv')
  ]).then(([teamData, leagueData, playerShootingData, playerPerGameData]) => {
    
    // Panel 2: Top 3PT Teams by Year
    const teamDataFiltered = teamData.filter(d => {
      if (!d.season) return false;
      const year = parseInt(d.season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d.x3pa_per_game;
      d['3P%'] = d.x3p_percent ? +d.x3p_percent : null;
      d['3PM'] = +d.x3p_per_game;
      d.Team = d.team;
      d.Season = d.season;
      // Filter out "League Average" and ensure valid data
      return year >= 2020 && d['3PA'] != null && d['3P%'] != null && 
             d.Team && d.Team !== 'League Average' && d.Team !== 'League';
    });

    console.log('Team data sample:', teamDataFiltered.slice(0, 3));
    console.log('Team years available:', [...new Set(teamDataFiltered.map(d => d.year))].sort());

    // Function to update team table
    function updateTeamTable(sortBy = '3PA') {
      console.log('Updating team table sorted by:', sortBy);
      
      // Clear existing table and annotation
      panel2.selectAll('table').remove();
      panel2.selectAll('.team-filter-note').remove();

      // Filter teams based on sort criteria
      let filteredTeams = teamDataFiltered;
      if (sortBy === '3P%') {
        filteredTeams = teamDataFiltered.filter(d => d['3PA'] >= 30); // Minimum 30 team 3PA for meaningful percentage
      }

      // Group by year and get top 5 teams per year
      const teamsByYear = {};
      filteredTeams.forEach(d => {
        if (!teamsByYear[d.year]) teamsByYear[d.year] = [];
        teamsByYear[d.year].push(d);
      });

      // Sort teams by selected metric within each year and take top 5
      Object.keys(teamsByYear).forEach(year => {
        teamsByYear[year].sort((a, b) => b[sortBy] - a[sortBy]);
        teamsByYear[year] = teamsByYear[year].slice(0, 5);
      });

      // Add annotation for 3P% filter
      if (sortBy === '3P%') {
        panel2.append('p')
          .attr('class', 'team-filter-note')
          .text('Note: Only teams with 30+ 3PA per game are shown for meaningful percentage comparisons')
          .style('color', '#1976d2')
          .style('font-size', '0.9em')
          .style('font-style', 'italic')
          .style('margin-bottom', '10px');
      }

      const teamTable = panel2.append('table')
        .style('width', '100%')
        .style('border-collapse', 'collapse')
        .style('font-size', '0.9em');

      // Header
      teamTable.append('thead').append('tr')
        .selectAll('th')
        .data(['Year', 'Team', '3PA', '3P%', '3PM'])
        .enter().append('th')
        .text(d => d)
        .style('padding', '8px')
        .style('text-align', 'left')
        .style('border-bottom', '2px solid #dee2e6')
        .style('background', '#e9ecef');

      // Rows
      const teamTbody = teamTable.append('tbody');
      const teamRows = [];
      Object.keys(teamsByYear).sort().forEach(year => {
        teamsByYear[year].forEach((team, i) => {
          teamRows.push({
            year: year,
            team: team.Team,
            '3PA': team['3PA'],
            '3P%': team['3P%'],
            '3PM': team['3PM'],
            rank: i + 1
          });
        });
      });

      const teamTableRows = teamTbody.selectAll('tr')
        .data(teamRows)
        .enter().append('tr')
        .style('background', (d, i) => {
          // Check if this is the first row of a new year
          if (i === 0 || teamRows[i-1].year !== d.year) {
            return '#e3f2fd'; // Light blue background for year headers
          }
          return i % 2 === 0 ? '#f8f9fa' : 'white';
        })
        .style('border-top', (d, i) => {
          // Add bold line between years
          if (i === 0 || teamRows[i-1].year !== d.year) {
            return '2px solid #1976d2';
          }
          return 'none';
        });

      teamTableRows.selectAll('td')
        .data(d => [
          d.year,
          d.team,
          d['3PA'].toFixed(1),
          (d['3P%'] * 100).toFixed(1) + '%',
          d['3PM'].toFixed(1)
        ])
        .enter().append('td')
        .text(d => d)
        .style('padding', '6px 8px')
        .style('border-bottom', '1px solid #dee2e6')
        .style('font-weight', (d, i, nodes) => {
          // Make year column bold for first row of each year
          const rowIndex = Math.floor(i / 5); // 5 teams per year
          const isFirstInYear = i % 5 === 0;
          return isFirstInYear ? 'bold' : 'normal';
        });
    }

    // Initial team table
    updateTeamTable('3PA');

    // Update team table when sort changes
    teamSortSelect.on('change', function() {
      console.log('Team sort changed to:', this.value);
      updateTeamTable(this.value);
    });

    // Panel 3: Team 3PT by Year (Full width)
    const panel3 = dashboard.append('div')
      .style('grid-column', '1 / -1')
      .style('grid-row', '2')
      .style('background', '#f8f9fa')
      .style('border-radius', '8px')
      .style('padding', '15px')
      .style('border', '1px solid #dee2e6');

    panel3.append('h3')
      .text('Team 3PT Performance by Year')
      .style('margin', '0 0 15px 0')
      .style('color', '#333')
      .style('font-size', '1.2em');

    // Process player data
    const playerData = playerShootingData.map(shooting => {
      const perGame = playerPerGameData.find(pg => 
        pg.player === shooting.player && pg.season === shooting.season
      );
      return {
        ...shooting,
        ...perGame
      };
    }).filter(d => d.player && d.season && d.x3pa_per_game && d.x3p_percent);

    console.log('Player data sample:', playerData.slice(0, 3));

    // Filter and process player data
    const processedPlayerData = playerData.filter(d => {
      if (!d.season) return false;
      const year = parseInt(d.season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d.x3pa_per_game;
      d['3P%'] = d.x3p_percent ? +d.x3p_percent : null;
      d['3PM'] = d.x3p_per_game ? +d.x3p_per_game : null;
      d.Player = d.player;
      d.Tm = d.team;
      d.Season = d.season;
      return d['3PA'] != null && d['3P%'] != null && d['3PA'] > 0;
    });

    console.log('Processed player data sample:', processedPlayerData.slice(0, 3));

    // Get available years for player data
    const playerYears = [...new Set(processedPlayerData.map(d => d.year))].sort();
    const defaultYear = playerYears.includes(2025) ? 2025 : Math.max(...playerYears);

    console.log('Available years:', playerYears);
    console.log('Default year:', defaultYear);

    // Year selector for players
    const playerYearSelector = panel1.append('div')
      .style('margin-bottom', '15px');

    playerYearSelector.append('label')
      .text('Select Year: ')
      .style('margin-right', '10px')
      .style('font-weight', 'bold');

    const playerSelect = playerYearSelector.append('select')
      .style('padding', '5px')
      .style('border-radius', '4px')
      .style('border', '1px solid #ccc')
      .style('margin-right', '15px');

    // Populate dropdown options
    playerSelect.selectAll('option')
      .data(playerYears)
      .enter().append('option')
      .attr('value', d => d)
      .text(d => d)
      .property('selected', d => d === defaultYear);

    // Sort by selector for players
    playerYearSelector.append('label')
      .text('Sort by: ')
      .style('margin-right', '10px')
      .style('font-weight', 'bold');

    const sortSelect = playerYearSelector.append('select')
      .style('padding', '5px')
      .style('border-radius', '4px')
      .style('border', '1px solid #ccc');

    const sortOptions = [
      {value: '3PA', label: '3PA (Volume)'},
      {value: '3P%', label: '3P% (Accuracy)'},
      {value: '3PM', label: '3PM (Makes)'}
    ];

    sortSelect.selectAll('option')
      .data(sortOptions)
      .enter().append('option')
      .attr('value', d => d.value)
      .text(d => d.label)
      .property('selected', d => d.value === '3PA');

    console.log('Dropdown populated with years:', playerYears);

    // Function to update player table
    function updatePlayerTable(selectedYear, sortBy = '3PA') {
      console.log('Updating player table for year:', selectedYear, 'sort by:', sortBy);
      
      // Clear existing table
      panel1.selectAll('table').remove();

      // Filter players for selected year
      let yearPlayers = processedPlayerData.filter(d => d.year === selectedYear);
      
      // Remove duplicates (keep first occurrence of each player)
      const seen = new Set();
      yearPlayers = yearPlayers.filter(d => {
        const key = `${d.Player}-${d.year}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      // Apply minimum 3PA filter when sorting by 3P%
      if (sortBy === '3P%') {
        yearPlayers = yearPlayers.filter(d => d['3PA'] >= 5);
        console.log('Filtered to players with 5+ 3PA:', yearPlayers.length);
      }

      // Get top 10 by selected metric
      yearPlayers = yearPlayers
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, 10);

      console.log('Players for year', selectedYear, 'sorted by', sortBy, ':', yearPlayers.length);

      if (yearPlayers.length === 0) {
        panel1.append('p')
          .text(`No player data available for ${selectedYear}`)
          .style('color', '#666')
          .style('font-style', 'italic');
        return;
      }

      const shooterTable = panel1.append('table')
        .style('width', '100%')
        .style('border-collapse', 'collapse')
        .style('font-size', '0.9em');

      // Header
      shooterTable.append('thead').append('tr')
        .selectAll('th')
        .data(['Rank', 'Player', 'Team', '3PA', '3P%', '3PM'])
        .enter().append('th')
        .text(d => d)
        .style('padding', '8px')
        .style('text-align', 'left')
        .style('border-bottom', '2px solid #dee2e6')
        .style('background', '#e9ecef');

      // Rows
      const tbody = shooterTable.append('tbody');
      const rows = tbody.selectAll('tr')
        .data(yearPlayers)
        .enter().append('tr')
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).style('background', '#f1f3f4');
        })
        .on('mouseout', function() {
          d3.select(this).style('background', 'transparent');
        })
        .on('click', function(event, d) {
          showPlayerDetails(d);
        });

      rows.selectAll('td')
        .data((d, i) => [
          i + 1,
          d.Player,
          d.Tm || 'N/A',
          d['3PA'].toFixed(1),
          (d['3P%'] * 100).toFixed(1) + '%',
          d['3PM'] ? d['3PM'].toFixed(1) : 'N/A'
        ])
        .enter().append('td')
        .text(d => d)
        .style('padding', '8px')
        .style('border-bottom', '1px solid #dee2e6');
    }

    // Function to update annotation
    function updateAnnotation(sortBy) {
      // Remove existing annotation
      panel1.selectAll('.filter-note').remove();
      
      // Add annotation only for 3P% filter
      if (sortBy === '3P%') {
        panel1.append('p')
          .attr('class', 'filter-note')
          .text('Note: Only players with 5+ 3PA per game are shown for meaningful percentage comparisons')
          .style('color', '#1976d2')
          .style('font-size', '0.9em')
          .style('font-style', 'italic')
          .style('margin-bottom', '10px');
      }
    }

    // Initial player table
    updatePlayerTable(defaultYear, '3PA');
    updateAnnotation('3PA');

    // Update player table when year or sort changes
    playerSelect.on('change', function() {
      console.log('Year changed to:', this.value);
      const currentSort = sortSelect.property('value');
      updatePlayerTable(+this.value, currentSort);
      // Don't update annotation here - keep it for the same filter
    });

    sortSelect.on('change', function() {
      console.log('Sort changed to:', this.value);
      const currentYear = +playerSelect.property('value');
      updatePlayerTable(currentYear, this.value);
      updateAnnotation(this.value); // Update annotation when filter changes
    });

    // Panel 3: Interactive Team 3PT Chart
    const svg = panel3.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Year selector
    const yearSelector = panel3.append('div')
      .style('margin-bottom', '15px');

    yearSelector.append('label')
      .text('Select Year: ')
      .style('margin-right', '10px')
      .style('font-weight', 'bold');

    const select = yearSelector.append('select')
      .style('padding', '5px')
      .style('border-radius', '4px')
      .style('border', '1px solid #ccc')
      .style('margin-right', '15px');

    const years = [...new Set(teamDataFiltered.map(d => d.year))].sort();
    console.log('Team years available:', years);

    if (years.length === 0) {
      yearSelector.append('p')
        .text('No team data available')
        .style('color', '#666')
        .style('font-style', 'italic');
    } else {
      select.selectAll('option')
        .data(years)
        .enter().append('option')
        .attr('value', d => d)
        .text(d => d);

      // Sort selector for chart
      yearSelector.append('label')
        .text('Sort by: ')
        .style('margin-right', '10px')
        .style('font-weight', 'bold');

      const chartSortSelect = yearSelector.append('select')
        .style('padding', '5px')
        .style('border-radius', '4px')
        .style('border', '1px solid #ccc');

      const chartSortOptions = [
        {value: '3PA', label: '3PA (Volume)'},
        {value: '3P%', label: '3P% (Accuracy)'},
        {value: '3PM', label: '3PM (Makes)'}
      ];

      chartSortSelect.selectAll('option')
        .data(chartSortOptions)
        .enter().append('option')
        .attr('value', d => d.value)
        .text(d => d.label)
        .property('selected', d => d.value === '3PA');

      // Initial chart
      updateTeamChart(years[0], '3PA');

      // Update chart when year or sort changes
      select.on('change', function() {
        console.log('Team chart year changed to:', this.value);
        updateTeamChart(+this.value, chartSortSelect.property('value'));
      });

      chartSortSelect.on('change', function() {
        console.log('Team chart sort changed to:', this.value);
        updateTeamChart(+select.property('value'), this.value);
      });
    }

    function updateTeamChart(selectedYear, sortBy = '3PA') {
      console.log('Updating team chart for year:', selectedYear, 'sort by:', sortBy);
      
      // Clear existing annotation
      panel3.selectAll('.chart-filter-note').remove();
      
      let yearData = teamDataFiltered.filter(d => d.year === selectedYear);
      
      // Apply minimum 3PA filter when sorting by 3P%
      if (sortBy === '3P%') {
        yearData = yearData.filter(d => d['3PA'] >= 30);
        console.log('Filtered to teams with 30+ 3PA:', yearData.length);
        
        // Add annotation for 3P% filter
        panel3.append('p')
          .attr('class', 'chart-filter-note')
          .text('Note: Only teams with 30+ 3PA per game are shown for meaningful percentage comparisons')
          .style('color', '#1976d2')
          .style('font-size', '0.9em')
          .style('font-style', 'italic')
          .style('margin-bottom', '10px');
      }
      
      yearData = yearData
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, 15); // Top 15 teams

      console.log('Teams for year', selectedYear, 'sorted by', sortBy, ':', yearData.length);

      // Clear previous chart
      svg.selectAll('*').remove();

      if (yearData.length === 0) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '1.1em')
          .style('fill', '#666')
          .text(`No team data available for ${selectedYear}`);
        return;
      }

      // Process data - convert 3P% to whole numbers for display
      yearData = yearData.map(d => {
        const processed = {...d};
        if (sortBy === '3P%') {
          processed['3P%_display'] = d['3P%'] * 100; // Convert to whole numbers
        }
        return processed;
      });

      // Scales
      const x = d3.scaleBand()
        .domain(yearData.map(d => d.Team))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([
          sortBy === '3P%' 
            ? d3.min(yearData, d => d['3P%_display']) * 0.95  // Use converted 3P% values
            : 0,  // Start at 0 for 3PA and 3PM
          sortBy === '3P%'
            ? d3.max(yearData, d => d['3P%_display']) * 1.05  // Use converted 3P% values
            : d3.max(yearData, d => d[sortBy]) * 1.05
        ])
        .range([height, 0]);

      // X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '10px'); // Smaller font size

      // Y axis (left only, whole numbers)
      svg.append('g')
        .call(d3.axisLeft(y).tickFormat(d3.format('d')));

      // Bars
      svg.selectAll('rect')
        .data(yearData)
        .enter().append('rect')
        .attr('x', d => x(d.Team))
        .attr('y', d => y(sortBy === '3P%' ? d['3P%_display'] : d[sortBy]))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(sortBy === '3P%' ? d['3P%_display'] : d[sortBy]))
        .attr('fill', '#1976d2')
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 1);
          showTooltip(event, d, sortBy);
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 0.8);
          hideTooltip();
        });

      // Title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '1.1em')
        .style('font-weight', 'bold')
        .text(`Top 15 Teams by ${sortBy} - ${selectedYear}`);

      // Y axis label
      const yAxisLabels = {
        '3PA': '3PA per Game',
        '3P%': '3P% (Whole Numbers)',
        '3PM': '3PM per Game'
      };
      
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yAxisLabels[sortBy] || 'Value');
    }

    // Tooltip
    const tooltip = d3.select('#viz').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');

    function showTooltip(event, d, sortBy) {
      tooltip.transition().duration(200).style('opacity', 1);
      let tooltipContent;
      if (sortBy === '3P%') {
        tooltipContent = `<strong>${d.Team}</strong><br>3PA: ${d['3PA'].toFixed(1)}<br>3P%: ${(d['3P%'] * 100).toFixed(1)}%`;
      } else if (sortBy === '3PM') {
        tooltipContent = `<strong>${d.Team}</strong><br>3PM: ${d['3PM'].toFixed(1)}<br>3PA: ${d['3PA'].toFixed(1)}<br>3P%: ${(d['3P%'] * 100).toFixed(1)}%`;
      } else {
        tooltipContent = `<strong>${d.Team}</strong><br>3PA: ${d['3PA'].toFixed(1)}<br>3P%: ${(d['3P%'] * 100).toFixed(1)}%`;
      }
      tooltip.html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    }

    function hideTooltip() {
      tooltip.transition().duration(500).style('opacity', 0);
    }

    // Player details modal
    function showPlayerDetails(player) {
      // Remove existing modal
      d3.selectAll('.player-modal').remove();

      const modal = d3.select('body').append('div')
        .attr('class', 'player-modal')
        .style('position', 'fixed')
        .style('top', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', '100%')
        .style('background', 'rgba(0,0,0,0.5)')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('z-index', '1000');

      const modalContent = modal.append('div')
        .style('background', 'white')
        .style('padding', '30px')
        .style('border-radius', '8px')
        .style('max-width', '500px')
        .style('text-align', 'center');

      modalContent.append('h2')
        .text(player.Player)
        .style('margin', '0 0 20px 0')
        .style('color', '#333');

      modalContent.append('p')
        .html(`<strong>Team:</strong> ${player.Tm || 'N/A'}`)
        .style('margin', '10px 0');

      modalContent.append('p')
        .html(`<strong>Season:</strong> ${player.Season}`)
        .style('margin', '10px 0');

      modalContent.append('p')
        .html(`<strong>3PA per Game:</strong> ${player['3PA'].toFixed(1)}`)
        .style('margin', '10px 0');

      modalContent.append('p')
        .html(`<strong>3P%:</strong> ${(player['3P%'] * 100).toFixed(1)}%`)
        .style('margin', '10px 0');

      modalContent.append('p')
        .html(`<strong>3PM per Game:</strong> ${player['3PM'] ? player['3PM'].toFixed(1) : 'N/A'}`)
        .style('margin', '10px 0');

      // Add additional stats if available
      if (player.G) {
        modalContent.append('p')
          .html(`<strong>Games Played:</strong> ${player.G}`)
          .style('margin', '10px 0');
      }

      if (player.MP) {
        modalContent.append('p')
          .html(`<strong>Minutes per Game:</strong> ${player.MP}`)
          .style('margin', '10px 0');
      }

      modalContent.append('button')
        .text('Close')
        .style('margin-top', '20px')
        .style('padding', '10px 20px')
        .style('background', '#1976d2')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .on('click', () => modal.remove());

      // close on background click
      modal.on('click', function(event) {
        if (event.target === this) modal.remove();
      });
    }
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('Explore the data! Use the year selectors to see different seasons. Click on players in the top 10 list to see detailed stats. The interactive dashboard shows real player and team data from your CSV files. Discover who the top 3-point shooters were in different years and how teams ranked in 3-point shooting.');
}

// Initialize
renderScene(); 