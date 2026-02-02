const natural = require('natural');
const trainingData = require('./categorizadorDataset');

class Categorizador {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.entrenar();
  }

  entrenar() {
    /*console.log('Entrenando clasificador Naive Bayes...');*/
    
    let totalPatrones = 0;
    Object.keys(trainingData).forEach(categoria => {
      trainingData[categoria].forEach(palabra => {
        this.classifier.addDocument(palabra.toLowerCase(), categoria);
        totalPatrones++;
      });
    });
    
    this.classifier.train();
    /*console.log(`Categorizador entrenado con ${totalPatrones} patrones en ${Object.keys(trainingData).length} categorías`);*/
    
    // Test rápido
    const testCases = ['tottus', 'metro', 'wong', 'uber', 'taxi', 'netflix', 'jabon', 'shampoo'];
    testCases.forEach(test => {
      const resultado = this.categorizar(test);
      const clasificaciones = this.classifier.getClassifications(test);
      const confianza = clasificaciones[0]?.value || 0;
      console.log(`"${test}" → ${resultado} (${(confianza * 100).toFixed(1)}%)`);
    });
    /*console.log('===================\n');*/
  }

  contarPatrones() {
    return Object.values(trainingData).reduce((sum, arr) => sum + arr.length, 0);
  }

  categorizar(descripcion) {
    if (!descripcion || descripcion.trim().length === 0) {
      return 'Otros';
    }

    const texto = descripcion.toLowerCase().trim();
    const clasificaciones = this.classifier.getClassifications(texto);
    
    // Siempre tomar la primera sugerencia (la más probable)
    if (clasificaciones && clasificaciones.length > 0) {
      return clasificaciones[0].label;
    }

    return 'Otros';
  }

  obtenerConfianza(descripcion) {
    if (!descripcion) return 0;
    
    const texto = descripcion.toLowerCase().trim();
    const clasificaciones = this.classifier.getClassifications(texto);
    return (clasificaciones[0]?.value || 0).toFixed(2);
  }

  sugerirCategorias(descripcion, limite = 3) {
    if (!descripcion) return [];
    
    const texto = descripcion.toLowerCase().trim();
    const clasificaciones = this.classifier.getClassifications(texto);
    
    return clasificaciones
      .slice(0, limite)
      .map(c => ({
        categoria: c.label,
        confianza: (c.value * 100).toFixed(0)
      }));
  }
}

const categorizador = new Categorizador();

module.exports = categorizador;