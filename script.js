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
    entradas.forEach(function(entrada){
        if (entrada.isIntersecting) {

        const indice = Array.from(secoes).indexOf(entradas.target);

        mostrar(indice);

        lista.scrollTo({
            top:fotos[indice].offsetTop, behavior: 'smooth'
        })
    }
})
    
}, {
    rootMargin: '-45% 0px -45% 0px'
});

secoes.forEach(function (secao){
    vigia.observe(secao);
})



function scrollsuave(destino, duracao = 1500) {
    const inicio = window.scrollY;
    const fim = destino.getBoundingClientRect().top + window.scrollY - 20;
    const distancia = fim - inicio;
    let t0 = null;
    function passo(t) {
        if (!t0) t0 = t;
        const progresso = Math.min((t - t0) / duracao, 1);
        const ease = progresso < 0.5
        ? 2 * progresso * progresso
        : 1 - Math.pow(-2 * progresso + 2, 2) / 2;
        window.scrollTo(0, inicio + distancia * ease);
        if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
}

const id_comida = document.querySelector('#comidas');
const btn_hero = document.querySelector('.btn-hero');
if (btn_hero && id_comida) {
    btn_hero.addEventListener('click', (e) => {
        e.preventDefault();
        scrollsuave(id_comida, 800);
    });
}


document.querySelectorAll('.menu a[href^="#"').forEach(function (link){
    link.addEventListener('click', function(e){
        e.preventDefault();
        const alvo = document.querySelector(link.getAttribute('href'));
        if (alvo) scrollsuave(alvo, 1200)
    })
})


const items = document.querySelectorAll('.titulo, .lista-faq, .local, .mapa');

const revelador = new IntersectionObserver(function(entradas) {
    entradas.forEach(function(entrada) {
        if(entrada.isIntersecting) {
            entrada.target.classList.add('visivel');
            revelador.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.15
});

items.forEach(function(item) {
    item.classList.add('revelar');
    revelador.observe(item);
})

