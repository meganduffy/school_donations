queue()
   .defer(d3.json, "/donorsUS/projects")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

   //Clean projectsJson data
   var donorsUSProjects = projectsJson;
   var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
   donorsUSProjects.forEach(function (d) {
       d["date_posted"] = dateFormat.parse(d["date_posted"]);
       d["date_posted"].setDate(1);
       d["total_donations"] = +d["total_donations"];
   });


   //Create a Crossfilter instance
   var ndx = crossfilter(donorsUSProjects);

   //Define Dimensions
   var dateDim = ndx.dimension(function (d) {
       return d["date_posted"];
   });
   var resourceTypeDim = ndx.dimension(function (d) {
       return d["resource_type"];
   });
   var povertyLevelDim = ndx.dimension(function (d) {
       return d["poverty_level"];
   });
   var stateDim = ndx.dimension(function (d) {
       return d["school_state"];
   });

   var fundingStatus = ndx.dimension(function (d) {
       return d["funding_status"];
   });

    // MEGAN'S CODE

    var primaryFocusSubjectDim = ndx.dimension(function (d) {
        return d["primary_focus_subject"];
    });

    var gradeLevelDim = ndx.dimension(function (d) {
        return d["grade_level"];
    });

    var schoolMetroDim = ndx.dimension(function (d) {
        return d["school_metro"];
    });

    var primaryFocusAreaDim = ndx.dimension(function (d) {
        return d["primary_focus_area"];
    });


   //Calculate metrics
   var numProjectsByDate = dateDim.group();
   var numProjectsByResourceType = resourceTypeDim.group();
   var numProjectsByPovertyLevel = povertyLevelDim.group();
   var numProjectsByFundingStatus = fundingStatus.group();
   var totalDonationsByState = stateDim.group().reduceSum(function (d) {
       return d["total_donations"];
   });
   var stateGroup = stateDim.group();

    // MEGAN'S CODE

    var totalSchoolDistrict = ndx.groupAll().reduceSum(function (d) {  // returns length of school_district array
        return d["school_district"].length;
    });

    var numProjectsByPrimaryFocusSubject = primaryFocusSubjectDim.group();

    var numProjectsByGradeLevel = gradeLevelDim.group();

    var numProjectsBySchoolMetro = schoolMetroDim.group();

    var numProjectsByPrimaryFocusArea = primaryFocusAreaDim.group();


   var all = ndx.groupAll();
   var totalDonations = ndx.groupAll().reduceSum(function (d) {
       return d["total_donations"];
   });

   var max_state = totalDonationsByState.top(1)[0].value;

   //Define values (to be used in charts)
   var minDate = dateDim.bottom(1)[0]["date_posted"];
   var maxDate = dateDim.top(1)[0]["date_posted"];

   //Charts
   var timeChart = dc.barChart("#time-chart");
   var resourceTypeRowChart = dc.rowChart("#resource-type-row-chart");
   var numberProjectsND = dc.numberDisplay("#number-projects-nd");
   var totalDonationsND = dc.numberDisplay("#total-donations-nd");
   var fundingStatusPieChart = dc.pieChart("#funding-pie-chart");

    // MEGAN'S CODE
    var totalSchoolDistrictND = dc.numberDisplay("#total-school-district-nd");
    var primaryFocusSubjectRowChart = dc.rowChart("#primary-focus-subject-row-chart");
    var povertyLevelPieChart = dc.pieChart("#poverty-level-pie-chart");
    var gradeLevelPieChart = dc.pieChart("#grade-level-pie-chart");
    var schoolMetroPieChart = dc.pieChart("#school-metro-pie-chart");
    var primaryFocusAreaRowChart = dc.rowChart("#primary-focus-area-row-chart");


    //IN USE AND ORDER


    selectField = dc.selectMenu('#menu-select')
       .dimension(stateDim)
       .group(stateGroup);

    totalSchoolDistrictND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalSchoolDistrict)
        .formatNumber(d3.format(".3s"));

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

   totalDonationsND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalDonations)
       .formatNumber(d3.format(".3s"));

    timeChart
       .width(860)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(dateDim)
       .group(numProjectsByDate)
       .transitionDuration(500)
       .x(d3.time.scale().domain([minDate, maxDate]))
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxis().ticks(4);

    fundingStatusPieChart
       .height(200)
       .radius(90)
       .innerRadius(0)
       .renderTitle(false)
       .transitionDuration(1500)
       .dimension(fundingStatus)
       .group(numProjectsByFundingStatus)
       .ordinalColors(['#e63032', '#ec5e60', '#f18c8d']);

    gradeLevelPieChart
        .height(230)
        .radius(100)
        .transitionDuration(1800)
        .dimension(gradeLevelDim)
        .group(numProjectsByGradeLevel)
        .externalLabels(20)
        .ordinalColors(['#f3cc28', '#f4d240', '#f5d758', '#f7dd70']);

    povertyLevelPieChart
        .height(230)
        .radius(100)
        .transitionDuration(2000)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .externalLabels(10);

    schoolMetroPieChart
        .height(230)
        .radius(100)
        .transitionDuration(2500)
        .dimension(schoolMetroDim)
        .group(numProjectsBySchoolMetro)
        .externalLabels(20)
        .ordinalColors(['#76b32f', '#85bb46', '#94c45d', '#a3cc74']);

    primaryFocusSubjectRowChart
        .width(720)
        .height(550)
        .renderTitle(false)
        .dimension(primaryFocusSubjectDim)
        .group(numProjectsByPrimaryFocusSubject)
        .xAxis().ticks(8);

    resourceTypeRowChart
       .width(300)
       .height(200)
       .dimension(resourceTypeDim)
       .group(numProjectsByResourceType)
       .xAxis().ticks(4);

    primaryFocusAreaRowChart
        .width(300)
        .height(200)
        .dimension(primaryFocusAreaDim)
        .group(numProjectsByPrimaryFocusArea)
        .xAxis().ticks(4);

   dc.renderAll();
}