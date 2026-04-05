// Mock data generator for the dashboard
// Replicates the patterns observed in the provided dataset images
// for 2011 and 2012 across Ahmedabad, Surat, Vadodara, Rajkot, and Gandhinagar.

const generateData = () => {
    const cities = [
        { name: 'Ahmedabad', popBase: 1000000, energyBase: 400, wasteBase: 120, renBase: 35 },
        { name: 'Surat', popBase: 1100000, energyBase: 450, wasteBase: 130, renBase: 45 },
        { name: 'Vadodara', popBase: 800000, energyBase: 300, wasteBase: 100, renBase: 50 },
        { name: 'Rajkot', popBase: 750000, energyBase: 350, wasteBase: 110, renBase: 40 },
        { name: 'Gandhinagar', popBase: 900000, energyBase: 280, wasteBase: 90, renBase: 60 }
    ];

    const years = [2011, 2012];
    const data = [];

    // Real data points extracted from the images to ensure exact match on first few rows
    const realDataOverrides = {
        "2011-Ahmedabad-1": { energy: 308, waste: 96, ren: 35, pop: 1463111 },
        "2011-Ahmedabad-2": { energy: 332, waste: 198, ren: 13, pop: 1199158 },
        "2011-Surat-1": { energy: 525, waste: 150, ren: 66, pop: 1263529 },
        "2011-Surat-2": { energy: 367, waste: 184, ren: 47, pop: 847220 },
        "2012-Vadodara-1": { energy: 566, waste: 64, ren: 13, pop: 831356 },
        "2012-Rajkot-1": { energy: 408, waste: 122, ren: 15, pop: 1179530 }
    };

    years.forEach(year => {
        cities.forEach(city => {
            for (let month = 1; month <= 12; month++) {
                const key = `${year}-${city.name}-${month}`;
                
                let energy, waste, renewable, population;

                if (realDataOverrides[key]) {
                    energy = realDataOverrides[key].energy;
                    waste = realDataOverrides[key].waste;
                    renewable = realDataOverrides[key].ren;
                    population = realDataOverrides[key].pop;
                } else {
                    // Generate realistic variations
                    const monthFactor = 1 + (Math.sin(month / 12 * Math.PI * 2) * 0.2); // Seasonal variation
                    const yearFactor = year === 2012 ? 1.05 : 1.0; // 5% growth in 2012

                    energy = Math.floor(city.energyBase * monthFactor * yearFactor + (Math.random() * 150 - 50));
                    waste = Math.floor(city.wasteBase * monthFactor * yearFactor + (Math.random() * 60 - 20));
                    renewable = Math.floor(city.renBase * monthFactor * yearFactor + (Math.random() * 30 - 10));
                    population = Math.floor(city.popBase * yearFactor + (Math.random() * 400000 - 100000));
                }

                data.push({
                    year,
                    month,
                    city: city.name,
                    energyConsumption: energy,
                    wasteGenerated: waste,
                    renewableEnergy: renewable,
                    population: population
                });
            }
        });
    });

    return data;
};

window.dashboardData = generateData();

// Mock data generator for India Map States
const generateIndiaData = () => {
    const statesInfo = [
        { id: 'IN-AP', name: 'Andhra Pradesh', pop: 53903618 },
        { id: 'IN-AR', name: 'Arunachal Pradesh', pop: 1383727 },
        { id: 'IN-AS', name: 'Assam', pop: 31205576 },
        { id: 'IN-BR', name: 'Bihar', pop: 104099452 },
        { id: 'IN-CT', name: 'Chhattisgarh', pop: 25545198 },
        { id: 'IN-GA', name: 'Goa', pop: 1458545 },
        { id: 'IN-GJ', name: 'Gujarat', pop: 60439692 },
        { id: 'IN-HR', name: 'Haryana', pop: 25351462 },
        { id: 'IN-HP', name: 'Himachal Pradesh', pop: 6864602 },
        { id: 'IN-JH', name: 'Jharkhand', pop: 32988134 },
        { id: 'IN-KA', name: 'Karnataka', pop: 61095297 },
        { id: 'IN-KL', name: 'Kerala', pop: 33406061 },
        { id: 'IN-MP', name: 'Madhya Pradesh', pop: 72626809 },
        { id: 'IN-MH', name: 'Maharashtra', pop: 112374333 },
        { id: 'IN-MN', name: 'Manipur', pop: 2855794 },
        { id: 'IN-ML', name: 'Meghalaya', pop: 2966889 },
        { id: 'IN-MZ', name: 'Mizoram', pop: 1097206 },
        { id: 'IN-NL', name: 'Nagaland', pop: 1978502 },
        { id: 'IN-OR', name: 'Odisha', pop: 41974218 },
        { id: 'IN-PB', name: 'Punjab', pop: 27743338 },
        { id: 'IN-RJ', name: 'Rajasthan', pop: 68548437 },
        { id: 'IN-SK', name: 'Sikkim', pop: 610577 },
        { id: 'IN-TN', name: 'Tamil Nadu', pop: 72147030 },
        { id: 'IN-TG', name: 'Telangana', pop: 35193978 },
        { id: 'IN-TR', name: 'Tripura', pop: 3673917 },
        { id: 'IN-UP', name: 'Uttar Pradesh', pop: 199812341 },
        { id: 'IN-UT', name: 'Uttarakhand', pop: 10086292 },
        { id: 'IN-WB', name: 'West Bengal', pop: 91276115 }
    ];

    return statesInfo.map(state => {
        // Base numbers off population for some correlation
        const pFactor = state.pop / 1000000;
        return {
            id: state.id,
            name: state.name,
            population: state.pop,
            energy: Math.floor(pFactor * (100 + Math.random() * 50)), // GWh
            waste: Math.floor(pFactor * (20 + Math.random() * 10)),   // Thousand Tons
            renewable: Math.floor(pFactor * (30 + Math.random() * 20)) // GWh
        };
    });
};

window.indiaStateData = generateIndiaData();
