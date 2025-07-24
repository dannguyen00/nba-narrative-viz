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
    renderScene();
  }
}
function prevScene() {
  if (currentScene > 0) {
    currentScene--;
    renderScene();
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
    // console.log('Loaded data:', data.slice(0, 5));
    // Filter for 1979-80 onward and valid 3PA
    const filtered = data.filter(d => {
      // d.Season is a string like "2024-25"
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      return year >= 1980 && d['3PA'] != null && d['3PA'] !== '';
    });
    // console.log('Filtered data:', filtered);

    // X and Y scales
    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.year))
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d['3PA']) * 1.1])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('Season');

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y));
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', -margin.left + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .text('3PA per Game');

    // Line
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d['3PA']));
    svg.append('path')
      .datum(filtered)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2.5)
      .attr('d', line);

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

    svg.selectAll('circle')
      .data(filtered)
      .enter().append('circle')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d['3PA']))
      .attr('r', 4)
      .attr('fill', '#ffb300')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d.Season}</strong><br>3PA: ${d['3PA'].toFixed(1)}<br>3P%: ${d['3P%'] ? (d['3P%']*100).toFixed(1)+'%' : 'N/A'}`)
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

    // Annotation: 1979-80 intro, 1994-97 short, 2015+ boom
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
    const makeAnnotations = d3.annotation()
      .type(d3.annotationLabel)
      .accessors({
        x: d => x(d.year),
        y: d => y(d['3PA'])
      })
      .annotations(annotations.map(a => ({
        note: a.note,
        x: x(a.data.year),
        y: y(a.data['3PA']),
        dx: a.dx,
        dy: a.dy
      })));
    svg.append('g').call(makeAnnotations);

    // Title
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '1.3em')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('NBA League Average 3-Point Attempts per Game (1980–Present)');
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('The NBA introduced the 3-point line in 1979-80. Since then, 3-point attempts have steadily increased, with major jumps in the mid-1990s and the 2010s. Hover over points for details.');
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
    // Filter for 1990-2000
    const filtered = data.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['2PA'] = +d['FGA'] - +d['3PA'];
      return year >= 1990 && year <= 2000 && d['3PA'] != null && d['3P%'] != null && d['2PA'] != null;
    });

    // X scale
    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.year))
      .range([0, plotWidth]);
    // Y scale for attempts
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => Math.max(d['3PA'], d['2PA'])) * 1.1])
      .range([height, 0]);
    // Y scale for 3P%
    const yRight = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d['3P%']) * 1.15])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
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

    // Draw lines
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
        tooltip.html(`<strong>${d.Season}</strong><br>3PA: ${d['3PA'].toFixed(1)}`)
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
        tooltip.html(`<strong>${d.Season}</strong><br>2PA: ${d['2PA'].toFixed(1)}`)
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
        tooltip.html(`<strong>${d.Season}</strong><br>3P%: ${(d['3P%']*100).toFixed(1)}%`)
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

    // Annotation for 1994-1997 (line shortened)
    svg.append('rect')
      .attr('x', x(1994))
      .attr('y', 0)
      .attr('width', x(1997) - x(1994))
      .attr('height', height)
      .attr('fill', '#ffb300')
      .attr('opacity', 0.08);
    svg.append('text')
      .attr('x', x(1994) + (x(1997) - x(1994))/2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffb300')
      .attr('font-size', '1em')
      .attr('font-weight', 'bold')
      .text('3PT Line Shortened');

    // Legend (with lines)
    const legend = svg.append('g')
      .attr('transform', `translate(${plotWidth + 60}, 10)`);
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
      .text('NBA 3PA, 2PA, and 3P% (1990–2000)');
  });

  d3.select('#annotation').append('div')
    .attr('class', 'annotation')
    .html('From 1994–1997, the NBA shortened the 3-point line to encourage more attempts. This chart compares 3PA, 2PA, and 3P% during the 1990s. Hover over points for details.');
}
function showScene3() {
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

  Promise.all([
    d3.csv('data/suns_pergame.csv'),
    d3.csv('data/league_stats.csv')
  ]).then(([sunsData, leagueData]) => {
    // Suns: Filter for 2000–2010
    const suns = sunsData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      d['3P%'] = d['3P%'] ? +d['3P%'] : null;
      d['MP'] = +d['MP'];
      return year >= 2000 && year <= 2010 && d['3PA'] != null && d['3P%'] != null && d['MP'] != null;
    });
    // League: Filter for 2000–2010
    const league = leagueData.filter(d => {
      if (!d.Season) return false;
      const year = parseInt(d.Season.split('-')[0]);
      d.year = year;
      d['3PA'] = +d['3PA'];
      return year >= 2000 && year <= 2010 && d['3PA'] != null;
    });
    // Map league by year for tooltip
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
      .domain([0, d3.max(suns, d => d['3P%']) * 1.15])
      .range([height, 0]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
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
      .attr('stroke', '#d32f2f')
      .attr('stroke-width', 2.5)
      .attr('d', lineLeague3PA);
    svg.append('path')
      .datum(suns)
      .attr('fill', 'none')
      .attr('stroke', '#ffb300')
      .attr('stroke-width', 2.5)
      .style('stroke-dasharray', '5 3')
      .attr('d', line3Ppct);

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
      .attr('fill', '#d32f2f')
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

    // Annotation for 2004–2010 (7 seconds or less)
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

    // Legend (with lines)
    const legend = svg.append('g')
      .attr('transform', `translate(${plotWidth + 60}, 10)`);
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
      .attr('stroke', '#d32f2f').attr('stroke-width', 3);
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
    .html('From 2004–2010, the Suns popularized the “7 seconds or less” offense, playing at a fast pace and shooting more threes. This chart compares Suns 3PA, league average 3PA, and Suns 3P%. Hover over points for details. Minutes played (MP) is shown in the tooltip for Suns.');
}
function showScene4() {
  d3.select('#viz').append('div').text('Scene 4: Warriors, Rockets, Modern Era');
  d3.select('#annotation').append('div').attr('class', 'annotation').text('The Warriors and Rockets led the 3-point revolution.');
}
function showScene5() {
  d3.select('#viz').append('div').text('Scene 5: 2020–Present Boom');
  d3.select('#annotation').append('div').attr('class', 'annotation').text('Positionless basketball and high-volume shooting.');
}
function showScene6() {
  d3.select('#viz').append('div').text('Scene 6: Free Exploration (interactive dashboard)');
  d3.select('#annotation').append('div').attr('class', 'annotation').text('Explore top shooters, teams, and trends.');
}

// --- Initialize ---
renderScene(); 