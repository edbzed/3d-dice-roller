type DiceRoll = {
  dice1: number;
  dice2: number;
  timestamp: number;
};

type RollStats = {
  totalRolls: number;
  averageSum: number;
  mostCommonSum: number;
  mostCommonSumCount: number;
  highestSum: number;
  lowestSum: number;
  sumDistribution: Record<number, number>;
  luckyNumber: number;
};

export const useAnalytics = () => {
  const trackRoll = (dice1: number, dice2: number) => {
    const rolls = JSON.parse(localStorage.getItem('diceRolls') || '[]') as DiceRoll[];
    rolls.push({ dice1, dice2, timestamp: Date.now() });
    // Keep only the last 7 rolls
    localStorage.setItem('diceRolls', JSON.stringify(rolls.slice(-7)));
  };

  const getRollHistory = (): DiceRoll[] => {
    return JSON.parse(localStorage.getItem('diceRolls') || '[]');
  };

  const resetData = () => {
    localStorage.removeItem('diceRolls');
  };

  const getStats = (): RollStats => {
    const rolls = getRollHistory();
    if (rolls.length === 0) {
      return {
        totalRolls: 0,
        averageSum: 0,
        mostCommonSum: 0,
        mostCommonSumCount: 0,
        highestSum: 0,
        lowestSum: 0,
        sumDistribution: {},
        luckyNumber: 7,
      };
    }

    const sums = rolls.map(roll => roll.dice1 + roll.dice2);
    const distribution: Record<number, number> = {};
    
    let mostCommonSum = sums[0];
    let mostCommonSumCount = 1;
    
    sums.forEach(sum => {
      distribution[sum] = (distribution[sum] || 0) + 1;
      if (distribution[sum] > mostCommonSumCount) {
        mostCommonSum = sum;
        mostCommonSumCount = distribution[sum];
      }
    });

    const averageSum = sums.reduce((a, b) => a + b, 0) / sums.length;
    const highestSum = Math.max(...sums);
    const lowestSum = Math.min(...sums);

    // Find the number that appeared most in winning rolls (above average)
    const luckyNumbers = rolls.flatMap(roll => 
      (roll.dice1 + roll.dice2 > averageSum) ? [roll.dice1, roll.dice2] : []
    );
    const luckyNumberCounts: Record<number, number> = {};
    luckyNumbers.forEach(n => luckyNumberCounts[n] = (luckyNumberCounts[n] || 0) + 1);
    const luckyNumber = Object.entries(luckyNumberCounts)
      .reduce((a, b) => (b[1] > (luckyNumberCounts[Number(a[0])] || 0) ? b : a), ['1', 0])[0];

    return {
      totalRolls: rolls.length,
      averageSum: Number(averageSum.toFixed(1)),
      mostCommonSum,
      mostCommonSumCount,
      highestSum,
      lowestSum,
      sumDistribution: distribution,
      luckyNumber: Number(luckyNumber),
    };
  };

  return { trackRoll, getRollHistory, getStats, resetData };
};