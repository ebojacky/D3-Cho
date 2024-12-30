// Define async function to load data
async function loadData() {
	// Load data using Promise.all and await
	const data = await Promise.all([
		d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
		d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),
	]);

	createChoroplethChart(data);
}

function createChoroplethChart(data) {
	const [counties, education] = data;

	// SVG and dimensions
	const width = 960;
	const height = 600;
	const svg = d3.select("#choropleth").attr("width", width).attr("height", height);

	// Color scale for education data
	const colorScale = d3.scaleThreshold().domain([15, 30, 45, 60]).range(d3.schemeBlues[5]);

	// Path generator
	const path = d3.geoPath();

	// Draw counties
	svg.append("g")
		.selectAll("path")
		.data(topojson.feature(counties, counties.objects.counties).features)
		.enter()
		.append("path")
		.attr("class", "county") // User Story #3: Each county has a class of "county".
		.attr("d", path)
		.attr("data-fips", (d) => d.id) // User Story #5: Assigning data-fips property.
		.attr("data-education", (d) => {
			const match = education.find((e) => e.fips === d.id);
			return match ? match.bachelorsOrHigher : 0; // User Story #5: Assigning data-education property.
		})
		.attr("fill", (d) => {
			const match = education.find((e) => e.fips === d.id);
			return colorScale(match ? match.bachelorsOrHigher : 0); // User Story #4: At least 4 fill colors for counties.
		});

	// Tooltip
	const tooltip = d3.select("#tooltip").style("opacity", 0).attr("data-education", 0); // User Story #10: Tooltip with id="tooltip".

	svg.selectAll(".county")
		.on("mouseover", (event, d) => {
			const match = education.find((e) => e.fips === d.id);
			tooltip.transition().duration(200).style("opacity", 0.9);
			tooltip
				.html(`Area: ${match.area_name}<br>Education: ${match.bachelorsOrHigher}%`)
				.style("left", `${event.pageX + 10}px`)
				.style("top", `${event.pageY - 28}px`)
				.attr("data-education", match.bachelorsOrHigher); // User Story #11: Tooltip with data-education property.
		})
		.on("mouseout", () => {
			tooltip.transition().duration(500).style("opacity", 0);
		});

	// Legend for color scale
	const legendWidth = 200;
	const legendHeight = 20;

	// Legend group
	const legend = svg.append("g").attr("id", "legend").attr("transform", "translate(50, 550)");

	legend
		.selectAll("rect")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("x", (d, i) => i * (legendWidth / colorScale.range().length))
		.attr("width", legendWidth / colorScale.range().length)
		.attr("height", legendHeight)
		.attr("fill", (d) => d);

	// Adding labels under each color rectangle
	legend
		.selectAll("text")
		.data(colorScale.domain())
		.enter()
		.append("text")
		.text((d) => d)
		.attr("x", (d, i) => (i + 0.5) * (legendWidth / colorScale.range().length))
		.attr("y", legendHeight + 15)
		.attr("text-anchor", "middle")
		.attr("font-size", "10px");

	// Logging to check if legend elements are created
	console.log(d3.select("#legend").node());
}

// Call the async function to load data and continue
loadData();
