function handleFileSelect(evt) {
    d3.selectAll('svg').remove();
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            drawChartGeneral(e.target.result);
            drawChartSpecific(e.target.result);
        };
    })(file);

    reader.readAsDataURL(file);

    document.getElementById('select_container').style.display = "block";
    document.getElementById('diagrams_select').innerHTML = '';
}

function handleFileDestroy(evt) {
    document.getElementById('chart_general').remove();
    document.getElementById('chart_specific').remove();
    document.getElementById('select_patient').remove();
    document.getElementById('select_patient-hidden').remove();
    document.getElementById('diagrams_select').innerHTML = '';
    document.getElementById('select_container').style.display = "none";
    document.getElementById('file_input').value = '';
    document.getElementById('file_label').innerHTML = 'choose a .csv file';
}

document.getElementById('file_input').addEventListener('change', handleFileSelect, false);
document.getElementById('file_destroy').addEventListener('click', handleFileDestroy, false);

var margin = {top: 40, right: 20, bottom: 100, left: 40};

var width = 1104 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

function drawChartGeneral(url) {
    var diagramContainer = document.getElementById('chart_general');
    if (!diagramContainer) {
        d3.select('#diagrams_container').append('div')
            .attr('id', 'chart_general');
    } else {
        diagramContainer.innerHTML = '';
    }

    var svg = d3.select("#chart_general").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().range([0, width]).paddingInner(0.05).align(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    d3.csv(url, function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {
            d.codeOfPatient = +d.codeOfPatient;
            d.Wbc = +d.Wbc;
        });

        var patients = d3.map(data, function(d) { return d.codeOfPatient; }).keys();

        var selectButton = document.getElementById('select_patient-hidden');
        if (!selectButton) {
            d3.select('#select_container')
                .append('select')
                .attr('id', 'select_patient-hidden')
                .style("display", "none");
        } else {
            selectButton.innerHTML = '';
        }

        d3.select("#select_patient-hidden")
            .selectAll('myOptions')
            .data(patients)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        $('#select_patient-hidden')
            .clone()
            .attr('id', 'select_patient')
            .attr('name', 'select_patient')
            .attr('class', 'wide small')
            .appendTo($('#diagrams_select'))
            .niceSelect();

        var filteredData = data.filter(function(d) { return d.codeOfPatient == patients[0]; });

        x.domain(filteredData.map(function (d) {return d.dateOfAnalysis;}));
        y.domain([0, d3.max(filteredData, function (d) {return d.Wbc;})]);

        svg.append("text")
            .attr("class", "graph__subtitle")
            .attr("x", (width / 2))
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .text("Absolute numbers");

        svg.selectAll(".graph__bar")
            .data(filteredData)
            .enter().append("rect")
            .attr("class", "graph__bar")
            .attr("x", function (d) {return x(d.dateOfAnalysis);})
            .attr("y", function (d) {return y(d.Wbc);})
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", function(d) {
                if (d.Wbc >= 4.5 && d.Wbc <= 11) {return "#4CAF50"}
                else { return "#E91E63" }
                ;})
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] + 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip
                    .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
                    .style("display", "inline")
                    .select("text").text(`Wbc: ${d.Wbc}`);
            })
            .on("mouseout", function() { tooltip.style("display", "none"); });

        svg.append("g")
            .attr("class", "graph__axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        // .selectAll("text")
        // .attr("transform", "rotate(45)")
        // .attr("text-anchor", "start");

        svg.append("g")
            .attr("class", "graph__axis-y")
            .call(d3.axisLeft(y));

        var tooltip = svg.append("g")
            .attr("class", "graph__tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("class", "graph__tooltip-background")
            .attr("width", 100)
            .attr("height", 25)
            .attr("fill", "white")
            .style("opacity", 0.7);

        tooltip.append("text")
            .attr("class", "graph__tooltip-text")
            .attr("x", 50)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle");

        svg.selectAll(".graph__bar")
            .transition()
            .delay(function(d, i){ return i*50; })
            .duration(500)
            .attr("height", function (d) { return height - y(d.Wbc); });

        function updateGeneral(selectedGroup) {
            var dataFilter = data.filter(function(d) { return d.codeOfPatient == selectedGroup });

            x.domain(dataFilter.map(function (d) {return d.dateOfAnalysis;}));
            y.domain([0, d3.max(dataFilter, function (d) {return d.Wbc;})]);

            svg.selectAll(".graph__bar")
                .remove()
                .exit()
                .data(dataFilter)
                .enter().append("rect")
                .attr("class", "graph__bar")
                .attr("x", function (d) {return x(d.dateOfAnalysis);})
                .attr("y", function (d) {return y(d.Wbc);})
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", function(d) {
                    if (d.Wbc >= 4.5 && d.Wbc <= 11) {return "#4CAF50"}
                    else { return "#E91E63" }
                    ;})
                .on("mouseover", function() { tooltip.style("display", null); })
                .on("mousemove", function(d) {
                    var xPosition = d3.mouse(this)[0] + 5;
                    var yPosition = d3.mouse(this)[1] - 5;
                    tooltip
                        .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
                        .style("display", "inline")
                        .select("text").text(`Wbc: ${d.Wbc}`);
                })
                .on("mouseout", function() { tooltip.style("display", "none"); })

            svg.selectAll(".graph__axis-x")
                .remove()
                .exit();

            svg.selectAll(".graph__axis-y")
                .remove()
                .exit();

            svg.append("g")
                .attr("class", "graph__axis-x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("class", "graph__axis-y")
                .call(d3.axisLeft(y));

            var tooltip = svg.append("g")
                .attr("class", "graph__tooltip")
                .style("display", "none");

            tooltip.append("rect")
                .attr("class", "graph__tooltip-background")
                .attr("width", 100)
                .attr("height", 25)
                .attr("fill", "white")
                .style("opacity", 0.7);

            tooltip.append("text")
                .attr("class", "graph__tooltip-text")
                .attr("x", 50)
                .attr("dy", "1.2em")
                .style("text-anchor", "middle");

            svg.selectAll(".graph__bar")
                .transition()
                .delay(function(d, i){ return i*50; })
                .duration(500)
                .attr("height", function (d) { return height - y(d.Wbc); });
        }

        $("#select_patient").on("change", function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
            var selectedOption = this.options[this.selectedIndex].text;
            updateGeneral(selectedOption);
        });
    });
}

function drawChartSpecific(url) {
    var diagramContainer = document.getElementById('chart_specific');
    if (!diagramContainer) {
        d3.select('#diagrams_container').append('div')
            .attr('id', 'chart_specific')
            .attr('class', 'fadein');
    } else {
        diagramContainer.innerHTML = '';
    }

    var svg = d3.select("#chart_specific").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .range([0, width])
        .paddingInner(0.05)
        .align(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);
    var z = d3.scaleOrdinal()
    // .range(["#5867dd", "#0abb87", "#ffb822", "#fd397a", "#5d78ff"]);
        .range(["#f44336", "#E91E63", "#9C27B0", "#673AB7",
            "#3F51B5", "#2196F3", "#00BCD4", "#4CAF50",
            "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107",
            "#FF9800"]);

    d3.csv(url, function(d, i, columns) {
        for (i = 8, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }, function(error, data) {
        if (error) throw error;

        var patients = d3.map(data, function(d) { return d.codeOfPatient; }).keys();

        var filteredData = data.filter(function(d) { return d.codeOfPatient == patients[0]; });

        var keys = data.columns.slice(8);

        x.domain(filteredData.map(function (d) {return d.dateOfAnalysis;}));
        y.domain([0, d3.max(data, function (d) {return d.total;})]);
        z.domain(keys);

        svg.append("text")
            .attr("class", "graph__subtitle")
            .attr("x", (width / 2))
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .text("Relative numbers");

        svg.selectAll(".graph__bar")
            .data(d3.stack().keys(keys)(filteredData))
            .enter().append("g")
            .attr("class", "graph__bar")
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data.dateOfAnalysis); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] + 5;
                var yPosition = d3.mouse(this)[1] - 5;
                var key = _.findKey(d.data, function(v) {
                    return v === d[1]-d[0];
                });
                tooltip
                    .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
                    .style("display", "block")
                    .select("text").text(`${key}: ${d[1]-d[0]}%`);
            })
            .on("mouseout", function() { tooltip.style("display", "none"); });

        svg.append("g")
            .attr("class", "graph__axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "graph__axis-y")
            .call(d3.axisLeft(y));

        var legend = svg.append("g")
            .attr("class", "graph__legend")
            .attr("transform", "translate(0," + (height + margin.bottom - 40) + ")")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr( "transform", function(d,i) {
                xOff = (i % 7) * 150;
                yOff = Math.floor(i  / 7) * 30;
                return "translate(" + xOff + "," + yOff + ")"
            } );

        legend.append('rect')
            .attr("x", 0)
            .attr("y", -15)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", z);

        legend.append('text')
            .attr("x", 30)
            .attr("y", 0)
            .text(function (d) {return d})
            .style("font-size", "0.75rem");

        var tooltip = svg.append("g")
            .attr("class", "graph__tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("class", "graph__tooltip-background")
            .attr("width", 160)
            .attr("height", 25)
            .attr("fill", "white")
            .style("opacity", 0.7);

        tooltip.append("text")
            .attr("class", "graph__tooltip-text")
            .attr("x", 80)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle");

        function updateSpecific(selectedGroup) {

            var dataFilter = data.filter(function(d) { return d.codeOfPatient == selectedGroup });

            x.domain(dataFilter.map(function (d) {return d.dateOfAnalysis;}));

            svg.selectAll(".graph__bar")
                .remove()
                .exit()
                .data(d3.stack().keys(keys)(dataFilter))
                .enter().append("g")
                .attr("class", "graph__bar")
                .attr("fill", function(d) { return z(d.key); })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter().append("rect")
                .attr("x", function(d) { return x(d.data.dateOfAnalysis); })
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .attr("width", x.bandwidth())
                .on("mouseover", function() { tooltip.style("display", null); })
                .on("mousemove", function(d) {
                    var xPosition = d3.mouse(this)[0] + 5;
                    var yPosition = d3.mouse(this)[1] - 5;
                    var key = _.findKey(d.data, function(v) {
                        return v === d[1]-d[0];
                    });
                    tooltip
                        .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
                        .style("display", "block")
                        .select("text").text(`${key}: ${d[1]-d[0]}%`);
                })
                .on("mouseout", function() { tooltip.style("display", "none"); });

            svg.selectAll(".graph__axis-x")
                .remove()
                .exit();

            svg.selectAll(".graph__axis-y")
                .remove()
                .exit();

            svg.append("g")
                .attr("class", "graph__axis-x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("class", "graph__axis-y")
                .call(d3.axisLeft(y));

            var tooltip = svg.append("g")
                .attr("class", "graph__tooltip")
                .style("display", "none");

            tooltip.append("rect")
                .attr("class", "graph__tooltip-background")
                .attr("width", 160)
                .attr("height", 25)
                .attr("fill", "white")
                .style("opacity", 0.7);

            tooltip.append("text")
                .attr("class", "graph__tooltip-text")
                .attr("x", 80)
                .attr("dy", "1.2em")
                .style("text-anchor", "middle");
        }

        $("#select_patient").on("change", function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
            var selectedOption = this.options[this.selectedIndex].text;
            updateSpecific(selectedOption)
        })
    });
}