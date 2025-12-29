// 碳排放系数数据库 (基于CSV文件数据)
const emissionFactors = {
    // 食物排放系数 (克CO2/克)
    food: {
        beef: 26.6726,      // 牛肉
        pork: 23.8392,      // 猪肉
        chicken: 2.7889,    // 鸡肉
        fish: 6.0400,       // 鱼
        egg: 1.7580,        // 蛋
        milk: 0.3666,       // 牛奶
        vegetables: 0.0504, // 蔬菜
        rice: 2.9270        // 米
    },

    // 交通排放系数 (克CO2/公里)
    transport: {
        mtr: 7.80,          // 地铁
        bus: 27.90,         // 巴士
        minibus: 63.10,     // 小巴(柴油)
        tram: 27.40,        // 电车
        taxi: 121.00,       // 的士
        ferry: 2230.00,     // 渡轮
        walk: 0             // 步行/骑车
    },

    // 航空排放系数 (克CO2/公里)
    flight: {
        short: {
            economy: 135,    // 短途经济舱
            business: 210    // 短途商务舱
        },
        medium: {
            economy: 108,    // 中途经济舱
            business: 168    // 中途商务舱
        },
        long: {
            economy: 99,     // 长途经济舱
            business: 154    // 长途商务舱
        }
    },

    // 航班平均距离 (公里)
    flightDistance: {
        short: 300,      // 短途平均300公里
        medium: 1000,    // 中途平均1000公里
        long: 3000       // 长途平均3000公里
    },

    // 衣物排放系数 (克CO2/克)
    clothing: {
        cotton: 8.77,       // 棉质
        synthetic: 0.19     // 化纤/塑料
    },

    // 家居用品排放系数 (克CO2/克)
    household: {
        paper: 1.55,        // 纸张
        plastic: 0.19       // 塑料
    },

    // 用水排放系数 (假设值，需要根据实际数据调整)
    water: {
        perLiter: 0.5       // 克CO2/升 (包含处理、加热等)
    },

    // 用电排放系数 (克CO2/千瓦时)
    electricity: {
        CLP: 540,           // 中华电力
        HEC: 840            // 香港电灯
    },

    // 碳抵消
    carbonOffset: {
        treePerYear: 23000  // 每棵5米高树木每年吸收23kg CO2
    }
};

// 表单提交事件处理
document.getElementById('carbonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateEmissions();
});

// 计算碳排放的主函数
function calculateEmissions() {
    // 获取基本信息
    const period = parseFloat(document.getElementById('period').value);
    const recyclingFactor = parseFloat(document.getElementById('recycling').value);

    // 1. 计算饮食排放 (克CO2)
    const foodEmission = calculateFoodEmission(period);

    // 2. 计算通勤排放 (克CO2)
    const commuteEmission = calculateCommuteEmission(period);

    // 3. 计算周末出行排放 (克CO2)
    const weekendEmission = calculateWeekendEmission(period);

    // 4. 计算航空排放 (克CO2)
    const flightEmission = calculateFlightEmission(period);

    // 5. 计算衣物排放 (克CO2)
    const clothingEmission = calculateClothingEmission(period);

    // 6. 计算家居用品排放 (克CO2)
    const householdEmission = calculateHouseholdEmission(period);

    // 7. 计算用水排放 (克CO2)
    const waterEmission = calculateWaterEmission(period);

    // 8. 计算用电排放 (克CO2)
    const electricityEmission = calculateElectricityEmission(period);

    // 应用回收系数计算总排放
    const totalBeforeRecycling = foodEmission + commuteEmission + weekendEmission +
                                 flightEmission + clothingEmission + householdEmission +
                                 waterEmission + electricityEmission;

    const totalEmission = totalBeforeRecycling * recyclingFactor;

    // 转换为千克
    const totalKg = (totalEmission / 1000).toFixed(2);

    // 计算需要种植的树木数量
    const treesNeeded = Math.ceil((totalEmission / 1000) / (emissionFactors.carbonOffset.treePerYear/1000));

    // 显示结果
    displayResults({
        period: period,
        total: totalKg,
        food: (foodEmission / 1000).toFixed(2),
        commute: (commuteEmission / 1000).toFixed(2),
        weekend: (weekendEmission / 1000).toFixed(2),
        flight: (flightEmission / 1000).toFixed(2),
        clothing: (clothingEmission / 1000).toFixed(2),
        household: (householdEmission / 1000).toFixed(2),
        water: (waterEmission / 1000).toFixed(2),
        electricity: (electricityEmission / 1000).toFixed(2),
        trees: treesNeeded
    });
}

// 计算饮食排放
function calculateFoodEmission(period) {
    const beef = parseFloat(document.getElementById('beef').value) || 0;
    const pork = parseFloat(document.getElementById('pork').value) || 0;
    const chicken = parseFloat(document.getElementById('chicken').value) || 0;
    const fish = parseFloat(document.getElementById('fish').value) || 0;
    const egg = parseFloat(document.getElementById('egg').value) || 0;
    const milk = parseFloat(document.getElementById('milk').value) || 0;
    const vegetables = parseFloat(document.getElementById('vegetables').value) || 0;
    const rice = parseFloat(document.getElementById('rice').value) || 0;

    const dailyEmission =
        beef * emissionFactors.food.beef +
        pork * emissionFactors.food.pork +
        chicken * emissionFactors.food.chicken +
        fish * emissionFactors.food.fish +
        egg * emissionFactors.food.egg +
        milk * emissionFactors.food.milk +
        vegetables * emissionFactors.food.vegetables +
        rice * emissionFactors.food.rice;

    return dailyEmission * period;
}

// 计算通勤排放
function calculateCommuteEmission(period) {
    const mode = document.getElementById('commuteMode').value;
    const distance = parseFloat(document.getElementById('commuteDistance').value) || 0;
    const workDays = parseFloat(document.getElementById('workDays').value) || 0;

    // 单程距离 × 2 (往返) × 工作天数 × 周数
    const weeks = period / 7;
    const totalDistance = distance * 2 * workDays * weeks;

    return totalDistance * emissionFactors.transport[mode];
}

// 计算周末出行排放
function calculateWeekendEmission(period) {
    const mode = document.getElementById('weekendMode').value;
    const distance = parseFloat(document.getElementById('weekendDistance').value) || 0;
    const trips = parseFloat(document.getElementById('weekendTrips').value) || 0;

    const weeks = period / 7;
    const totalDistance = distance * trips * weeks;

    return totalDistance * emissionFactors.transport[mode];
}

// 计算航空排放
function calculateFlightEmission(period) {
    const flightShort = parseFloat(document.getElementById('flightShort').value) || 0;
    const flightMedium = parseFloat(document.getElementById('flightMedium').value) || 0;
    const flightLong = parseFloat(document.getElementById('flightLong').value) || 0;
    const flightClass = document.getElementById('flightClass').value;

    const shortEmission = flightShort * emissionFactors.flightDistance.short * 2 *
                         emissionFactors.flight.short[flightClass];
    const mediumEmission = flightMedium * emissionFactors.flightDistance.medium * 2 *
                          emissionFactors.flight.medium[flightClass];
    const longEmission = flightLong * emissionFactors.flightDistance.long * 2 *
                        emissionFactors.flight.long[flightClass];

    return shortEmission + mediumEmission + longEmission;
}

// 计算衣物排放
function calculateClothingEmission(period) {
    const cotton = parseFloat(document.getElementById('clothingCotton').value) || 0;
    const synthetic = parseFloat(document.getElementById('clothingSynthetic').value) || 0;

    return (cotton * 1000 * emissionFactors.clothing.cotton) +
           (synthetic * 1000 * emissionFactors.clothing.synthetic);
}

// 计算家居用品排放
function calculateHouseholdEmission(period) {
    const paper = parseFloat(document.getElementById('paper').value) || 0;
    const plastic = parseFloat(document.getElementById('plastic').value) || 0;

    return (paper * 1000 * emissionFactors.household.paper) +
           (plastic * 1000 * emissionFactors.household.plastic);
}

// 计算用水排放
function calculateWaterEmission(period) {
    const showerTime = parseFloat(document.getElementById('showerTime').value) || 0;
    const laundryFreq = parseFloat(document.getElementById('laundryFreq').value) || 0;

    // 洗澡用水：分钟/天 × 10升/分钟 × 天数
    const showerWater = showerTime * 10 * period;

    // 洗衣用水：次/周 × 100升/次 × 周数
    const laundryWater = laundryFreq * 100 * (period / 7);

    const totalWater = showerWater + laundryWater;

    return totalWater * emissionFactors.water.perLiter;
}

// 计算用电排放
function calculateElectricityEmission(period) {
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const source = document.getElementById('electricitySource').value;

    // 月用电量 × (周期天数 / 30)
    const totalElectricity = electricity * (period / 30);

    return totalElectricity * emissionFactors.electricity[source];
}

// 显示结果
function displayResults(results) {
    // 更新总排放
    document.getElementById('totalEmission').textContent = results.total;

    // 更新周期
    let periodText = '';
    if (results.period === 7) periodText = '一周';
    else if (results.period === 30) periodText = '一个月';
    else if (results.period === 365) periodText = '一年';
    else periodText = results.period + '天';
    document.getElementById('resultPeriod').textContent = periodText;

    // 更新各项排放
    document.getElementById('foodEmission').textContent = results.food;
    document.getElementById('commuteEmission').textContent = results.commute;
    document.getElementById('weekendEmission').textContent = results.weekend;
    document.getElementById('flightEmission').textContent = results.flight;
    document.getElementById('clothingEmission').textContent = results.clothing;
    document.getElementById('householdEmission').textContent = results.household;
    document.getElementById('waterEmission').textContent = results.water;
    document.getElementById('electricityEmission').textContent = results.electricity;

    // 更新树木数量
    document.getElementById('treesNeeded').textContent = results.trees;

    // 生成减排建议
    generateSuggestions(results);

    // 显示结果区域
    document.getElementById('result').classList.add('show');

    // 滚动到结果区域
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 生成减排建议
function generateSuggestions(results) {
    const suggestions = [];

    // 根据各项排放量生成建议
    if (parseFloat(results.food) > 50) {
        suggestions.push('🥗 <strong>饮食建议：</strong>多吃蔬菜，可减少约30-40%的饮食碳排放。');
    }

    if (parseFloat(results.commute) > 30) {
        suggestions.push('🚇 <strong>通勤建议：</strong>优先选择地铁、电车等公共交通。');
    }

    if (parseFloat(results.flight) > 100) {
        suggestions.push('✈️ <strong>旅行建议：</strong>减少非必要的航空旅行，优先选择高铁等低碳出行方式，选择经济舱而非商务舱。');
    }

    if (parseFloat(results.clothing) > 20) {
        suggestions.push('👕 <strong>购物建议：</strong>理性消费，购买耐用的衣物。');
    }

    if (parseFloat(results.electricity) > 100) {
        suggestions.push('⚡ <strong>用电建议：</strong>使用节能电器，及时关闭不用的电器电源。');
    }

    if (parseFloat(results.water) > 20) {
        suggestions.push('💧 <strong>用水建议：</strong>缩短淋浴时间，收集洗衣水用于冲厕或拖地。');
    }

    // 通用建议
    suggestions.push('♻️ <strong>回收建议：</strong>积极进行垃圾分类，回收废纸、塑料瓶等可回收物。');
    suggestions.push('🌱 <strong>抵消建议：</strong>参与植树活动，中和您的碳足迹。');

    // 显示建议
    const suggestionsHtml = suggestions.map(s => `<p style="margin-bottom: 10px;">• ${s}</p>`).join('');
    document.getElementById('suggestions').innerHTML = suggestionsHtml;
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('个人碳排放计算器已加载');
    console.log('数据来源：香港中小企业碳审计工具箱');
});
