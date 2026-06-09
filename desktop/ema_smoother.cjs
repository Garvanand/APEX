class EMASmoother {
    constructor(alpha = 0.15) {
        this.alpha = alpha;
        // States: 0=Flow, 1=Distracted, 2=Fatigued, 3=Overloaded
        this.smoothedProbabilities = [1.0, 0.0, 0.0, 0.0];
    }

    update(rawProbabilities) {
        for (let i = 0; i < 4; i++) {
            this.smoothedProbabilities[i] = 
                (this.alpha * rawProbabilities[i]) + 
                ((1 - this.alpha) * this.smoothedProbabilities[i]);
        }
        
        // Return the index of the highest smoothed probability
        let maxProb = -1;
        let maxIdx = 0;
        for (let i = 0; i < 4; i++) {
            if (this.smoothedProbabilities[i] > maxProb) {
                maxProb = this.smoothedProbabilities[i];
                maxIdx = i;
            }
        }
        
        return {
            stateIndex: maxIdx,
            confidence: this.smoothedProbabilities[maxIdx],
            probabilities: this.smoothedProbabilities
        };
    }
}

module.exports = EMASmoother;
