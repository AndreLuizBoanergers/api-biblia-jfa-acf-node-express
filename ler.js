const express = require('express');
const router = express.Router();
const fuzz = require('fuzzball');
const fs = require('fs');
const rawData = fs.readFileSync('./acf.json');
const bible = JSON.parse(rawData);

const chapterCounts = {};

// Itera sobre cada livro na Bíblia
bible.forEach(book => {
    const name = book.name;
    const abbrev = book.abbrev;
    const chapters = book.chapters;

    chapterCounts[abbrev] = chapters.length;

    console.log(`${name} (${abbrev}): ${chapters.length} capítulos`);
});


function encontrarLivroPorNome(nomeLivro) {
    // Encontrar o livro mais parecido usando matching fuzzy
    const opcoesLivros = bible.map(book => book.name);
    const resultadosFuzzy = fuzz.extract(nomeLivro, opcoesLivros, { scorer: fuzz.token_set_ratio });
    const livroMaisParecido = resultadosFuzzy[0][0];

    return bible.find(book => book.name === livroMaisParecido);
}

function obterVersiculo(livro, capitulo, versiculoInicio, versiculoFim) {
    const livroEncontrado = encontrarLivroPorNome(livro);

    if (livroEncontrado) {
        if (livroEncontrado.chapters[capitulo - 1]) {
            const versiculosDoCapitulo = livroEncontrado.chapters[capitulo - 1];
            const totalVersiculos = versiculosDoCapitulo.length;
            versiculoInicio = Math.max(1, Math.min(totalVersiculos, versiculoInicio || 1));
            versiculoFim = Math.min(totalVersiculos, Math.max(versiculoInicio, versiculoFim || totalVersiculos));

            const resultado = versiculosDoCapitulo
                .slice(versiculoInicio - 1, versiculoFim)
                .map((versiculo, index) => ({
                    livro: livroEncontrado.name,
                    capitulo: capitulo,
                    verso: versiculo,
                    indice: versiculoInicio + index
                }));

            if (resultado.length > 0) {
                return resultado;
            } else {
                return 'Verso não encontrado.';
            }
        } else {
            return 'Capítulo não encontrado.';
        }
    } else {
        return 'Livro não encontrado. Talvez você quis dizer: ' + encontrarLivroPorNome(livro).name;
    }
}
router.get('/:livro/:cap/:start/:end', async (req, res) => {
  const { livro, cap, start, end } = req.params;
  const resultado = obterVersiculo(livro, cap, start, end)
  res.send(JSON.stringify({"Livro": livro, "Captulo": cap, "Ver": start, "Ate": end,  resultado}));
});

module.exports = router;