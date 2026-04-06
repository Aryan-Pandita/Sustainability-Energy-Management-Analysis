document.addEventListener('DOMContentLoaded', () => {
    const rawData = window.dashboardData;
    
    // UI Elements
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    const kpiEnergy = document.getElementById('kpiEnergy');
    const kpiWaste = document.getElementById('kpiWaste');
    const kpiRenewable = document.getElementById('kpiRenewable');
    const kpiPopulation = document.getElementById('kpiPopulation');

    // Chart Instances
    let trendChartInstance = null;
    let renewableChartInstance = null;
    let cityComparisonChartInstance = null;
    let bubbleChartInstance = null;
    let radarChartInstance = null;
    let polarAreaChartInstance = null;
    let liveChartInstance = null;
    let energyMatrixChartInstance = null;
    let recyclingChartInstance = null;


    let liveInterval = null;

    // Theme Config
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Format Numbers
    const formatNum = (num) => new Intl.NumberFormat('en-IN').format(num);

    const getFilteredData = () => {
        let filtered = rawData;
        if (yearFilter.value !== 'All') {
            filtered = filtered.filter(d => d.year == yearFilter.value);
        }
        if (monthFilter.value !== 'All') {
            filtered = filtered.filter(d => d.month == monthFilter.value);
        }
        if (cityFilter.value !== 'All') {
            filtered = filtered.filter(d => d.city === cityFilter.value);
        }
        return filtered;
    };

    const updateDashboard = () => {
        const data = getFilteredData();
        
        // Update KPIs
        const totalEnergy = data.reduce((sum, d) => sum + d.energyConsumption, 0);
        const totalWaste = data.reduce((sum, d) => sum + d.wasteGenerated, 0);
        const totalRenewable = data.reduce((sum, d) => sum + d.renewableEnergy, 0);
        
        // For population, we take average of the available filtered data to mock distinct citizens
        const avgPopulation = data.length > 0 ? 
            Math.floor(data.reduce((sum, d) => sum + d.population, 0) / data.length) : 0;

        kpiEnergy.textContent = formatNum(totalEnergy);
        kpiWaste.textContent = formatNum(totalWaste);
        kpiRenewable.textContent = formatNum(totalRenewable);
        kpiPopulation.textContent = formatNum(avgPopulation);

        updateTrendChart(data);
        updateRenewableChart(data);
        updateCityComparisonChart(data);
        updateBubbleChart(data);
        updateRadarChart(data);
        updatePolarAreaChart(data);
        updateEnergyMatrixChart(data);
        updateRecyclingChart(data);
    };

    const updateRadarChart = (data) => {
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = { energy: 0, waste: 0, ren: 0, count: 0 };
            grouped[d.city].energy += d.energyConsumption;
            grouped[d.city].waste += d.wasteGenerated;
            grouped[d.city].ren += d.renewableEnergy;
            grouped[d.city].count += 1;
        });

        const cities = Object.keys(grouped);
        const energyAvg = cities.map(c => grouped[c].energy / grouped[c].count);
        const wasteAvg = cities.map(c => grouped[c].waste / grouped[c].count);
        const renAvg = cities.map(c => grouped[c].ren / grouped[c].count);

        if (radarChartInstance) radarChartInstance.destroy();

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: cities,
                datasets: [
                    {
                        label: 'Avg Energy',
                        data: energyAvg,
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.2)'
                    },
                    {
                        label: 'Avg Waste',
                        data: wasteAvg,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)'
                    },
                    {
                        label: 'Avg Renewable',
                        data: renAvg,
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.2)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#9ca3af' }
                    }
                }
            }
        });
    };

    const updatePolarAreaChart = (data) => {
        const ctx = document.getElementById('polarAreaChart').getContext('2d');
        
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = 0;
            grouped[d.city] += d.wasteGenerated;
        });

        if (polarAreaChartInstance) polarAreaChartInstance.destroy();

        polarAreaChartInstance = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(grouped),
                datasets: [{
                    label: 'Total Waste Generated',
                    data: Object.values(grouped),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });
    };

    const updateTrendChart = (data) => {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // Group by Month if simple, or Year-Month if all
        const grouped = {};
        data.forEach(d => {
            const key = `M${d.month}`;
            if (!grouped[key]) grouped[key] = { energy: 0, waste: 0 };
            grouped[key].energy += d.energyConsumption;
            grouped[key].waste += d.wasteGenerated;
        });

        const labels = Object.keys(grouped);
        const energyData = labels.map(l => grouped[l].energy);
        const wasteData = labels.map(l => grouped[l].waste);

        if (trendChartInstance) trendChartInstance.destroy();

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Energy (GWh)',
                        data: energyData,
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Waste (Metric Tons)',
                        data: wasteData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    };

    const updateRenewableChart = (data) => {
        const ctx = document.getElementById('renewableChart').getContext('2d');
        
        // Group by city for distribution
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = 0;
            grouped[d.city] += d.renewableEnergy;
        });

        if (renewableChartInstance) renewableChartInstance.destroy();

        renewableChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(grouped),
                datasets: [{
                    data: Object.values(grouped),
                    backgroundColor: ['#00f2fe', '#4facfe', '#38bdf8', '#818cf8', '#a78bfa'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    };

    const updateCityComparisonChart = (data) => {
        const ctx = document.getElementById('cityComparisonChart').getContext('2d');
        
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = { energy: 0, waste: 0 };
            grouped[d.city].energy += d.energyConsumption;
            grouped[d.city].waste += d.wasteGenerated;
        });

        if (cityComparisonChartInstance) cityComparisonChartInstance.destroy();

        cityComparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(grouped),
                datasets: [
                    {
                        label: 'Energy Consumed',
                        data: Object.values(grouped).map(d => d.energy),
                        backgroundColor: '#4facfe',
                        borderRadius: 4
                    },
                    {
                        label: 'Waste Generated',
                        data: Object.values(grouped).map(d => d.waste),
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    };

    const updateBubbleChart = (data) => {
        const ctx = document.getElementById('bubbleChart').getContext('2d');
        
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = { p: 0, e: 0, w: 0, count: 0 };
            grouped[d.city].p += d.population;
            grouped[d.city].e += d.energyConsumption;
            grouped[d.city].w += d.wasteGenerated;
            grouped[d.city].count += 1;
        });

        const bubbleData = Object.keys(grouped).map(city => {
            const avg = grouped[city];
            return {
                x: avg.e / avg.count, // Energy on X
                y: avg.w / avg.count, // Waste on Y
                r: (avg.p / avg.count) / 50000, // Size by Population
                city: city
            };
        });

        if (bubbleChartInstance) bubbleChartInstance.destroy();

        bubbleChartInstance = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Cities',
                    data: bubbleData,
                    backgroundColor: 'rgba(0, 242, 254, 0.6)',
                    borderColor: '#00f2fe'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.raw.city}: E=${Math.round(ctx.raw.x)}, W=${Math.round(ctx.raw.y)}`
                        }
                    }
                },
                scales: {
                    y: { title: { display: true, text: 'Avg Waste' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { title: { display: true, text: 'Avg Energy' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    };

    // Live Dashboard Functionality
    const initLiveDashboard = () => {
        const ctx = document.getElementById('liveStreamChart').getContext('2d');
        
        let liveLabels = Array.from({length: 20}, (_, i) => `T-${20-i}s`);
        let energyStream = Array.from({length: 20}, () => 400 + Math.random() * 50);
        let wasteStream = Array.from({length: 20}, () => 100 + Math.random() * 20);
        
        if (liveChartInstance) liveChartInstance.destroy();

        liveChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: liveLabels,
                datasets: [
                    {
                        label: 'Instant Energy Load (MW)',
                        data: energyStream,
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.2)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Instant Waste Processing (Tonnes/Hr)',
                        data: wasteStream,
                        borderColor: '#ef4444',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                scales: {
                    y: { suggestedMin: 50, suggestedMax: 500, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });


        liveInterval = setInterval(() => {
            // Shift arrays
            energyStream.shift();
            wasteStream.shift();
            
            // Add new data
            const newEnergy = 400 + Math.random() * 50;
            const newWaste = 100 + Math.random() * 20;
            energyStream.push(newEnergy);
            wasteStream.push(newWaste);


            liveChartInstance.update();

            // Update Live KPIs
            document.getElementById('liveEnergy').textContent = Math.round(newEnergy);
            document.getElementById('liveWaste').textContent = Math.round(newWaste);

            document.getElementById('liveEnergyGen').textContent = Math.round(newEnergy * 1.25 + Math.random() * 20);
            document.getElementById('liveRenewable').textContent = Math.round(newEnergy * 0.35 + Math.random() * 15);
            
        }, 2000);
    };

    const stopLiveDashboard = () => {
        if (liveInterval) {
            clearInterval(liveInterval);
            liveInterval = null;
        }
    };

    const updateEnergyMatrixChart = (data) => {
        const ctx = document.getElementById('energyMatrixChart').getContext('2d');
        
        let solar = 0, wind = 0, hydro = 0, coal = 0, gas = 0;
        data.forEach(d => {
            solar += d.renewableEnergy * 0.45;
            wind += d.renewableEnergy * 0.35;
            hydro += d.renewableEnergy * 0.20;
            coal += (d.energyConsumption - d.renewableEnergy) * 0.65;
            gas += (d.energyConsumption - d.renewableEnergy) * 0.35;
        });

        if (energyMatrixChartInstance) energyMatrixChartInstance.destroy();

        energyMatrixChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Solar', 'Wind', 'Hydro', 'Coal', 'Natural Gas'],
                datasets: [{
                    data: [solar, wind, hydro, coal, gas],
                    backgroundColor: ['#fb923c', '#34d399', '#38bdf8', '#475569', '#9ca3af'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } },
                cutout: '65%'
            }
        });
    };

    const updateRecyclingChart = (data) => {
        const ctx = document.getElementById('recyclingChart').getContext('2d');
        
        const grouped = {};
        data.forEach(d => {
            if (!grouped[d.city]) grouped[d.city] = { waste: 0, recycled: 0 };
            grouped[d.city].waste += d.wasteGenerated;
            grouped[d.city].recycled += d.wasteGenerated * (0.35 + (Math.random() * 0.2)); 
        });

        const cities = Object.keys(grouped);
        const landfill = cities.map(c => grouped[c].waste - grouped[c].recycled);
        const recycled = cities.map(c => grouped[c].recycled);

        if (recyclingChartInstance) recyclingChartInstance.destroy();

        recyclingChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cities,
                datasets: [
                    { label: 'Recycled Matrix', data: recycled, backgroundColor: '#34d399' },
                    { label: 'Landfill Waste', data: landfill, backgroundColor: '#ef4444' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { color: '#9ca3af' } },
                    y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { labels: { color: '#9ca3af' } } }
            }
        });
    };

    // Event Listeners
    yearFilter.addEventListener('change', updateDashboard);
    monthFilter.addEventListener('change', updateDashboard);
    cityFilter.addEventListener('change', updateDashboard);

    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // Trigger window resize after transition so charts fit to new layout
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        });
    }

    if (mobileSidebarToggle) {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
        }
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
            }
        });
    });
    
    // Initialize View
    updateDashboard();
    initLiveDashboard();

    // Initialize Google Map
    const drawIndiaMap = () => {
        if (!window.google || !window.google.visualization) return;
        
        const stateData = window.indiaStateData;
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'State ID');
        dataTable.addColumn('string', 'State Name');
        dataTable.addColumn('number', 'Energy (GWh)');
        dataTable.addColumn('number', 'Waste (k Tons)');

        stateData.forEach(s => {
            dataTable.addRow([s.id, s.name, s.energy, s.waste]);
        });

        const options = {
            region: 'IN',
            domain: 'IN',
            displayMode: 'regions',
            resolution: 'provinces',
            backgroundColor: 'transparent',
            datalessRegionColor: 'rgba(255,255,255,0.05)',
            defaultColor: '#00f2fe',
            colorAxis: {colors: ['#0369a1', '#0ea5e9', '#38bdf8', '#00f2fe']}
        };

        const chart = new google.visualization.GeoChart(document.getElementById('indiaMapContainer'));
        chart.draw(dataTable, options);
    };

    if (window.google) {
        google.charts.load('current', {
            'packages': ['geochart']
        });
        google.charts.setOnLoadCallback(drawIndiaMap);
    }
});
