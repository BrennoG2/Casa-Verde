//Faz comm que as abas do FAQ sumam e apareçam
const FaQ = document.querySelectorAll('.lista-faq dt');
for (let i = 0; i < FaQ.length ; i++) {
    const resposta = FaQ[i].nextElementSibling;
    resposta.classList.add('escondido');
    FaQ[i].addEventListener('click', function(){
        resposta.classList.toggle('escondido');
        FaQ[i].classList.toggle('aberto');
    })
}


const fotos = document.querySelectorAll('.comidas-diversas li');
const secoes = document.querySelectorAll('.description section');

function mostrar(indice) {
    secoes.forEach(function (secao, i){
        if (i === indice) {
            secao.classList.add('ativa');
            fotos[i].classList.add('selecionada');

        } else {
            secao.classList.remove('ativa');
            fotos[i].classList.remove('selecionada');
        }
    })
}

fotos.forEach(function(foto, indice) {
    foto.addEventListener('click', function(){
        mostrar(indice);
        secoes[indice].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        })
    })
})

mostrar(0);


const lista = document.querySelector('.comidas-diversas');
const vigia = new IntersectionObserver(function(entradas) {

    if (entradas.isIntersecting) {

        const indice = Array.from(secoes).indexOf(entradas.target);

        mostrar(indice);

        lista.scrollTo({
            top:fotos[indice].offsetTop, behavior: 'smooth'
        })
    }
}, {
    rootMargin: '-45% 0px -45% 0px'
});

secoes.forEach(function (secao){
    vigia.observe(secao);
})
