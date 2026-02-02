const natural = require('natural');
const trainingData = require('./categorizadorDataset');

class Categorizador {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.entrenar();
  }

  entrenar() {
    Object.keys(trainingData).forEach(categoria => {
      trainingData[categoria].forEach(palabra => {
        this.classifier.addDocument(palabra.toLowerCase(), categoria);
      });
    });
    
    this.classifier.train();
    console.log('✓ Categorizador entrenado con', this.contarPatrones(), 'patrones');
  }

  contarPatrones() {
    return Object.values(trainingData).reduce((sum, arr) => sum + arr.length, 0);
  }

  categorizar(descripcion) {
    if (!descripcion || descripcion.trim().length === 0) {
      return 'Otros';
    }

    const texto = descripcion.toLowerCase().trim();
    const categoria = this.classifier.classify(texto);
    const clasificaciones = this.classifier.getClassifications(texto);
    
    const confianza = clasificaciones[0]?.value || 0;

    if (confianza < 0.4) {
      return 'Otros';
    }

    return categoria;
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