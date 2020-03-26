document.addEventListener('DOMContentLoaded', () => {



    /*******************************************************************************************************************
     * Déclaration des variables
    *******************************************************************************************************************/

    const popin = document.querySelector('.popin');
    const helloSentence =  document.querySelector('.hello-sentence');
    const apiKey = "8d997d228ba44568be2504c61a3151f4";
    const sectionRecentlyViewed = document.querySelector('.section-recently-viewed');

    // On récupère les id des favoris enregistrés dans le Local Storage sous form de String
    // On obtient un tableau des id des favoris à partir de la String
    let favoritesSaved = localStorage.getItem('favorites');
    favoritesSaved = favoritesSaved ? favoritesSaved.split('+') : '';

    // Articles recemment vues stockés dans le Local Storage
    // On transform la String en JSON
    let recentlyViewed = JSON.parse(localStorage.getItem('recently-viewed'));
    if(!recentlyViewed) recentlyViewed = [];

    // Formulaire d'inscription
    const formRegister = document.querySelector('.form-register');
    const inputRegisterEmail = document.querySelector('#registerEmail');
    const inputRegisterPassword = document.querySelector('#registerPw');
    const inputRegisterPasswordConfirm = document.querySelector('#registerPwConfirm');
    const inputRegisterFirstname = document.querySelector('#registerFirstname');
    const inputRegisterLastname = document.querySelector('#registerlastname');

    // Formulaire de connexion
    const formLogin = document.querySelector('.form-login');
    const inputLoginEmail = document.querySelector('#loginEmail');
    const inputLoginPassword = document.querySelector('#loginPw');
    const loginLink = document.querySelector('.login');







    /*******************************************************************************************************************
     * Déclaration des fonctions
     *******************************************************************************************************************/

    /**
     * Connexion
     */
    const login = () => {
        let data = {
            email: inputLoginEmail.value,
            password: inputLoginPassword.value
        };
        fetchFunction('https://newsapp.dwsapp.io/api/login', 'POST', data)
            .then(result => {
                if(result.data) {

                    // Mise à jour du token dans le local storage
                    localStorage.setItem('user-token', result.data.token);

                    // Fermer la popin de connexion
                    popin.classList.add('hide');

                    // Afficher les infos de l'utilisateur
                    initUserInfos(result.data.user);

                } else {
                    showInvalidInput(inputLoginEmail, 'Adresse email incorrecte');
                    showInvalidInput(inputLoginPassword, 'Mot de passe incorrecte');
                }
            })
    };

    /**
     * Inscription
     */
    const register = () => {
        // Récuperer les valuers des champs du formulaire
        let data = {
            email: inputRegisterEmail.value,
            password:  inputRegisterPassword.value,
            firstname: inputRegisterFirstname.value,
            lastname:  inputRegisterLastname.value
        };
        fetchFunction('https://newsapp.dwsapp.io/api/register', 'POST', data)
            .then(result => {

                // Inscription réussie
                if(result.data) {

                    // On préremplie les champs de connexion avec ses informations
                    inputLoginEmail.value = inputRegisterEmail.value;
                    inputLoginPassword.value = inputRegisterPassword.value;

                    // On ouvre l'onglet connexion
                    loginLink.click();

                // Inscription échouée
                } else {

                    // On affiche un message d'erreur car l'email est déjà utilisée
                    showInvalidInput(inputRegisterEmail, 'Cette  adresse email est déjà utilisée')
                }
            })
    };

    /**
     * Déconnexion
     */
    const logout = () => {
        fetchFunction('https://newsapp.dwsapp.io/api/logout', 'GET')
            .then(result => {

                // Afficher la connexion inscription
                document.querySelectorAll('.no-connect').forEach(el => el.classList.remove('hidden'));

                // Cacher les sections du compte
                document.querySelectorAll('.is-connect').forEach(el => el.classList.add('hidden'));

                // Suppresion du token dans le local storage
                localStorage.setItem('user-token', null);

                // Suppression des favoris dans le local storage
                localStorage.setItem('favorites', '');
            })
    };

    /**
     * Afficher 10 articles aléatoirement dans .main-article-carousel
     */
    const initMainArticles = sourceID => {
        let container = document.querySelector('.main-article-carousel');
        if(container) {
            fetchFunction(`https://newsapp.dwsapp.io/api/news/${sourceID}/null`, 'POST',{"news_api_token": apiKey})
                .then( result => {

                    // Si la réponse contient des articles
                    if(result.data) {
                        let articles = result.data.articles;
                        let max = articles.length > 10 ? 10 : articles.length; // max d'articles à afficher

                        // On obtient l'ordre aléatoire des articles
                        // ex:  articleOrder = [2, 13, 7, 1, 9, 17, 24, 8, 5, 11]
                        let articleOrder = [];
                        while(articleOrder.length < max){

                            // i = index de l'article
                            // i = nombre aléatoire entre 0 et articles.length
                            let i = Math.floor(Math.random() * articles.length) + 1;

                            // si ce nombre n'est pas déjà dans articleOrder[] et si il existe un article avec pour index ce nombre, alors on l'ajoute à articleOrder[]
                            if(articleOrder.indexOf(i) === -1 && articles[i]) articleOrder.push(i);
                        }

                        // Implémentation de la class Article pour chaque article contenu dans articleOrder[]
                        articleOrder.forEach(index => {
                            let article = new Article(articles[index]);
                            article.insertInto(container);
                        });

                        // Initialisation du slider .main-article-carousel
                        createSlider(container, {
                            contain: true,
                            prevNextButtons: false,
                            wrapAround: true,
                            autoPlay: true,
                            pageDots: false
                        });
                    }
                });
        }
    };


    /**
     * Création d'un slider avec Flickity
     * @param container
     * @param options
     */
    const createSlider = (container, options) => {

        // Initialisation du slider
        let slider = new Flickity(container, options);

        // Empêcher le click sur un article lors du drag
        slider.on('dragStart', () => {
            container.classList.add('no-event')
        });
        slider.on('dragEnd', () => {
            container.classList.remove('no-event')
        });

        window.addEventListener('resize', () => {
            slider.resize();
        })
    };


    /**
     * Afficher les données de l'utilisateur et infos une fois connecté
     * @param user
     */
    const initUserInfos = (user) => {

        // Cacher la connexion inscription
        document.querySelectorAll('.no-connect').forEach(el => el.classList.add('hidden'));

        // Afficher les sections du compte
        document.querySelectorAll('.is-connect').forEach(el => el.classList.remove('hidden'));
        helloSentence.innerHTML = `Bonjour ${user.firstname} ${user.lastname}`;
    };

    /**
     * Afficher un message d'erreur sur le champs erronné jusqu'à ce que sa valeur change
     * @param input
     * @param message : String
     */
    const showInvalidInput = (input, message) => {
        let label = document.querySelector(`label[for="${input.id}"]`);

        // On stock l'ancien texte du label
        let oldLabelText = label.innerHTML;

        // Affiche le message d'erreur
        label.innerHTML = message;
        input.classList.add('invalid');

        // Détecte le changement de valeur de l'input
        input.addEventListener('keydown', () => {
            if(input.classList.contains('invalid')) {
                label.innerHTML = oldLabelText;
                input.classList.remove('invalid');
            }
        });
    };

    /**
     * Fonction fetch général
     * @param url = String
     * @param requestType = String
     * @param data = {}
     * @returns {Promise}
     */
    const fetchFunction = (url, requestType, data) => {
        return new Promise( resolve => {
            let options = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            if(requestType) options.method = requestType;
            options.body = JSON.stringify(data);
            fetch( url, options)
                .then( response => response.ok ? response.json() : 'Response not OK' )
                .then( jsonData => {
                    resolve(jsonData)
                })
                .catch( err => console.error(err) )
        })
    };

    /**
     * Afficher les articles récemment vues
     */
    const displayRecentlyViewed = () => {

        // Si il y a des article récemment vues
        if(recentlyViewed.length) {

            // On affiche la section
            sectionRecentlyViewed.classList.remove('hidden');

            // Pour chaque article récemment vues on l'affiche
            recentlyViewed.forEach(article => {
                let newArticle = new Article(article);
                newArticle.insertInto(sectionRecentlyViewed.querySelector('.articles-list'))
            });
        }
    };







    /*******************************************************************************************************************
     * Déclaration des Class
     *******************************************************************************************************************/

    class Article {

        constructor(article) {
            this.article = article;
            this.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Nomvembre', 'Décembre'];
            this.title = this.article.title;
            this.sourceId = this.article.source.id;
            this.sourceName = this.article.source.name;
            this.url = this.article.url;

            // Mettre la date au format
            this.date = new Date(this.article.publishedAt);
            this.date = this.date.getDate() + ' ' + this.months[this.date.getMonth()] + ' ' + this.date.getFullYear();

            // Afficher une image en placeholder si besoin
            this.image = this.article.urlToImage ?  this.article.urlToImage : 'assets/images/placeholder-image.jpg';

            // Vérifier si les contenus ne sont pas null pour éviter des balises vides
            this.description = this.article.description ? `<p>${this.article.description}</p>` : '';
            this.content = this.article.content ? `<p>${this.article.content}</p>` : '';
        }

        // Retourne la balise article
        getArticleContent(size = 0) {
            let articleEl = document.createElement('article');
            articleEl.classList.add('item');
            let content = '';

            // Miniature article
            if(size === 0) {
                content = ` <p>${this.date}</p>
                        <h2 class="article-title">${this.title}</h2>
                        ${this.description}`;

            // Popin article intégral
            } else {
                content = `<p>Publié le ${this.date}</p>
                        <p>Par ${this.sourceName}</p>
                        <h2 class="article-title">${this.title}</h2>
                        ${this.content}
                        <a href="${this.url}">Lire l'article en intégralité<i class="fas fa-arrow-right"></i></a>`;
            }

            // Contenu de la balsie article
            articleEl.innerHTML =
                ` <figure>
                    <img alt="${this.title}" src="${this.image}">
                    <figcaption>
                        ${content}
                    </figcaption>
                </figure>`;

            // Retourne la balise article avec son contenu
            return articleEl;
        }

        insertInto(container) {
            // On insert la balise de l'article dans container
            let newArticle = this.getArticleContent();
            container.appendChild(newArticle);

            newArticle.addEventListener('click', e => {
                e.preventDefault();

                // Affichage de l'article dans la popin .article-viewer
                articleViewerItem.updateContent(this.getArticleContent(1), this.sourceId);

                // Ajouter l'article aux récemments vues dans le Local Storage
                this.addToRecentlyViewed();
            })
        }

        addToRecentlyViewed() {
            // Afficher la section des articles récemment vues
            sectionRecentlyViewed.classList.remove('hidden');

            // On vérifie que l'article n'est pas déjà dans le Local Storage
            let isAlreadyInLocalStorage = recentlyViewed.includes(this.article);
            recentlyViewed.forEach(item => {
               if(item.title === this.article.title) {
                   isAlreadyInLocalStorage = true;
               }
            });

            if(!isAlreadyInLocalStorage) {
                let articlesShowed = sectionRecentlyViewed.querySelectorAll('.articles-list article');
                if(articlesShowed.length === 4) {
                    recentlyViewed.splice(0, 1);
                    articlesShowed[0].remove();
                }

                recentlyViewed.push(this.article);

                // jAjouter l'article au Local Storage
                localStorage.setItem('recently-viewed', JSON.stringify(recentlyViewed));

                // Afficher l'article à la liste des récemment vues
                let newArticle = new Article(this.article);
                newArticle.insertInto(sectionRecentlyViewed.querySelector('.articles-list'));
            }
        }
    }


    /**
     * Création des input radio correspondant aux médias (sources)
     */
    class Media {

        constructor(source) {
            this.containerSources = document.querySelector('.container-sources.normal');
            this.containerSourcesFavorites = document.querySelector('.container-sources.favorites');
            this.parentFavorites = document.querySelector('.parent-fav');
            this.id = source.id;
            this.name = source.name;
            this.source = source;
            this.insert();

            // Si l'utilisateur est connecté, on affiche les favoris
            let token = localStorage.getItem('user-token');
            if(token !== null && token !== 'null') {
                document.querySelectorAll('.is-connect').forEach(el => el.classList.remove('hidden'));
            }
        }

        // Affichage des inputs dans le formulaire
        insert() {

            let span = document.createElement('span');
            span.innerHTML +=
                `<input id="${this.id}" value="${this.id}" required type="radio" name="source">
                 <label for="${this.id}">${this.name}</label>
                 <i data-favorite="false" class="fas fa-heart is-connect hidden"></i>`;

            this.containerSources.append(span);

            let btn = span.querySelector('i');

            // Détecter le click sur le bouton d'ajout / suppression aux favoris
            btn.addEventListener('click', e => {
                e.preventDefault();

                // Valeur de data-favorite : false ou id du favoris
                let favoriteId = btn.dataset.favorite;
                let token = localStorage.getItem('user-token');

                // Si [data-favorite = "false"] le media n'est pas dans nos favoris, alors on l'ajoute
                if(btn.dataset.favorite === 'false') {
                    let data = {
                        id: this.id,
                        name: this.name,
                        description: this.source.description,
                        url: this.source.url,
                        category: this.source.category,
                        language: this.source.language,
                        country: this.source.country,
                        token: token
                    };
                    fetchFunction('https://newsapp.dwsapp.io/api/bookmark/', 'POST', data)
                        .then(result => {
                            let id = result.data.data['_id'];
                            if(id) {

                                // On attribut l'id du favoris
                                btn.setAttribute('data-favorite', id);
                                span.remove();
                                this.containerSourcesFavorites.append(span);

                                // On rend visible les medias favoris
                                this.parentFavorites.classList.remove('hide');

                                // On ajoute le favoris au local storage
                                favoritesSaved = localStorage.getItem('favorites');

                                // Les id des favoris sont séparés par +
                                favoritesSaved = favoritesSaved ? `${favoritesSaved}+${this.id}` : this.id;
                                localStorage.setItem('favorites', favoritesSaved);
                            }
                        })

                // On retire des favoris
                } else {
                    fetchFunction(`https://newsapp.dwsapp.io/api/bookmark/${favoriteId}`, 'DELETE', {token: token})
                        .then(result => {

                            // On met data-favorite à false
                            btn.setAttribute('data-favorite', 'false');
                            span.remove();
                            this.containerSources.prepend(span);

                            // Si les favoris sont vides alors on cache cette partie
                            if(!this.containerSourcesFavorites.querySelectorAll("span").length) {
                                this.parentFavorites.classList.add('hide');
                            }
                        })
                }
            });

            // Si son id est dans le local storage alors on l'affiche comme favoris
            if(favoritesSaved.includes(this.id)) {
                btn.click();
            }
        }
    }

    /**
     * Connexion et inscription depuis la Popin
     */
    class LoginRegisterPopin {

        constructor() {
            this.popin = document.querySelector('.popin');
            if(this.popin) {
                this.links = this.popin.querySelectorAll('h2');
                this.form = this.popin.querySelectorAll('form');
                this.init();
                this.initLinks(document.querySelectorAll('.open-popin a'));
                this.initLinks(this.links);
            }
        }

        init() {
            document.addEventListener('click', e => {
                if(!e.target.closest('.popin-content') && !e.target.closest('.open-popin')) {
                    this.popin.classList.add('hide');
                }
            })
        }

        /**
         * Changer de fenêtre entre connexion / inscription
         * @param links : Array
         */
        initLinks(links) {
            links.forEach(link => {
                link.addEventListener('click', () => {
                    this.popin.classList.remove('hide');
                    let i = [...links].indexOf(link);
                    this.initActive(i)
                });
            })
        }

        initActive(i) {
            this.links.forEach(item => item.classList.remove('active'));
            this.form.forEach(item => item.classList.remove('active'));
            this.links[i].classList.add('active');
            this.form[i].classList.add('active');
        }
    }


    /**
     * Formulaire de recherche selon source/média et mot clé
     */
    class SearchForm {

        constructor(sources) {
            this.sources = sources;
            this.form = document.querySelector('.form-search');
            this.containerSources = this.form.querySelector('.container-sources.normal');
            this.inputSearch = this.form.querySelector('#searchData');
            this.articlesContainer = document.querySelector('.articles-list');
            this.message = undefined;
            this.btnShowMore = undefined;
            this.init()
        }

        init() {

            // On affiche les sources (médias) disponibles
            this.displaySources();

            // On détecte la sélection d'une source (média)
            this.form.querySelectorAll('input[type="radio"]').forEach(input => {
                input.addEventListener('click', () => {

                    // Si un média était sélectionné on supprime sa première place
                    let lastInputSelected = document.querySelector('span.first');
                    if(lastInputSelected) lastInputSelected.classList.remove('first');

                    // Mettre le média en première position de la liste
                    input.closest('span').classList.add('first');

                    // Montrer une liste réduite des médias
                    this.showLess();

                    // Soumettre le formulaire au click sur un média
                    this.submit();
                })
            });

            this.form.addEventListener('submit', e => {
                e.preventDefault();
                this.submit();
            });

            this.showLastResearch();
        }

        // Afficher la dernière recherche
        showLastResearch() {

            // si l'utilisateur n'est pas connecté
            if(!localStorage.getItem('token')) {
                let keyword = localStorage.getItem('keyword');
                let source = localStorage.getItem('source');
                if(source) {

                    // On coche l'input de la dernière recherche
                    let input = document.querySelector(`input[id="${source}"]`);
                    input.checked = true;

                    // Si il y avait un mot clé on l'écrit à nouveau dans l'input
                    if(keyword && keyword !== 'null') this.inputSearch.value = keyword;

                    // On soumet la recherche
                    this.submit();
                }
            }
        }

        submit() {
            let keywords = this.inputSearch.value ? this.inputSearch.value : null;
            let source = this.form.querySelector('input:checked') ? this.form.querySelector('input:checked').value : null;

            if(source) {
                fetchFunction(`https://newsapp.dwsapp.io/api/news/${source}/${keywords}`, 'POST', {"news_api_token": apiKey}).then( result => {

                        // Vider la liste des articles déjà affichés
                        this.articlesContainer.innerHTML = '';

                        // Si le résultat contient des articles
                        if(result.data && result.data.articles.length) {

                            // Sauvegarde la dernière recherche dans le Local Storage
                            localStorage.setItem('keyword', keywords);
                            localStorage.setItem('source', source);

                            // On supprime le message d'erreur s'il est présent
                            if(this.message) {
                                this.message.remove();
                            }

                            // Récupérer 10 articles maximum
                            let max = result.data.articles.length > 10 ? 10 : result.data.articles.length;
                            for(let i=0; i<max; i++) {
                                let newArticle = new Article(result.data.articles[i]);
                                newArticle.insertInto(this.articlesContainer);
                            }
                        } else {

                            // Afficher un message d'erreur si aucun article trouvé
                            this.showError('Aucun article ne correspond à votre recherche');
                        }
                    })
            } else {
                this.showError('Sélectionne un média avant de lancer ta recherche')
            }


        }

        // On limite l'affichage des sources à 25
        showLess() {
            this.btnShowMore.innerHTML = 'Voir tout';
            this.containerSources.classList.remove('see-all');
        }

        // On affiche l'intégralité des sources
        showMore() {
            this.btnShowMore.innerText = 'Voir moins';
            this.containerSources.classList.add('see-all');
        }

        showError(text) {
            // Si le message n'exite pas déjà on le créé
            if(!this.message) {
                this.message = document.createElement('p');
                this.message.classList.add('error-msg');
            }

            // Met à jour le texte du message
            this.message.innerText = text;

            // Afficher le message dans le formulaire
            this.form.appendChild(this.message);

            // Supression du message d'erreur dès qu'on change la valeur de l'input
            this.form.querySelector('input').addEventListener('keydown', () => {
                this.message.remove();
            })
        }

        displaySources(start, end) {
            this.sources.forEach(source => {
                new Media(source)
            });

            // Si il y a + de 20 sources on ajoute un bouton "Voir tout"
            if(this.sources.length > 25) {

                // Création du bouton "voir tout"
                this.btnShowMore = document.createElement('p');
                this.btnShowMore.innerText = 'Voir tout';
                this.btnShowMore.className = 'see-all-btn';
                this.containerSources.append(this.btnShowMore);

                //
                this.btnShowMore.addEventListener('click', e => {
                    e.preventDefault();
                    if(this.containerSources.classList.contains('see-all')) {
                        this.showLess();
                    } else {
                        this.showMore();
                    }
                })
            }
        }
    }

    /**
     * Afficher une popin avec les détails de l'article ainsi que 10 articles de la sources
     */
    class ArticleViewer {

        constructor() {
            this.popin = document.querySelector('.article-viewer');
            if(this.popin) {
                this.content = this.popin.querySelector('.article-content');
                this.suggestions = this.popin.querySelector('.articles-list');

                // fermer la popin quand on clic syr le bouton retour
                this.popin.querySelector('.back-btn').addEventListener('click', e => {
                    e.preventDefault();
                    this.popin.classList.add('hidden');
                })
            }
        }

        updateSuggestions(sourceID) {

            // Vide les anciennes suggestions
            this.suggestions.className = 'articles-list';
            this.suggestions.innerHTML = '';

            fetchFunction(`https://newsapp.dwsapp.io/api/news/${sourceID}/null`, 'POST',{"news_api_token": apiKey})
                .then(result => {
                    let articles = result.data.articles;
                    let max = articles.length > 10 ? 10 : articles.length; // max d'articles à afficher
                    for(let i=0; i<max; i++) {

                        // Afficher l'article
                        let article = new Article(articles[i]);
                        article.insertInto(this.suggestions);
                    }

                    // Initialisation du slider .main-article-carousel
                    createSlider(this.suggestions, {
                        contain: true,
                        prevNextButtons: false,
                        wrapAround: true,
                        pageDots: true,
                        cellAlign: 'left'
                    });
                })
        }

        updateContent(content, sourceID) {
            // Scroll en haut de la popin
            this.popin.scrollTo(0,0);

            // Afficher la popin
            this.popin.classList.remove('hidden');

            // Afficher l'article
            this.content.innerHTML = '';
            this.content.append(content);

            // Afficher les suggestions corresponds à la source (média)
            this.updateSuggestions(sourceID);
        }
    }








    /*******************************************************************************************************************
     * Début du programme
     *******************************************************************************************************************/

    // vérifier si l'utilisateur est déjà connecté
    let token = localStorage.getItem('user-token');
    if(token !== null && token !== 'null') {
        fetchFunction('https://newsapp.dwsapp.io/api/me', 'POST', {token: token})
            .then(result => {

                // Si la réponse correspond à un utilisateur
                if(result.data && result.data.user) {

                    // Afficher les infos de l'utilisateur
                    initUserInfos(result.data.user);
                }
            })
    }

    // Initialiser la popin pour visionner les articles
    const articleViewerItem = new ArticleViewer();

    // Initialiser la popin de connexion / inscription
    new LoginRegisterPopin();

    // Obtenir la liste des sources
    fetchFunction('https://newsapp.dwsapp.io/api/news/sources', 'POST',{"news_api_token": apiKey})
        .then(result => {

            // Afficher aléatoirement 10 article de la source dans .main-article-carousel
            initMainArticles('business-insider');

            if(result.data) {
                const sources = result.data.sources;

                // Initialisation du formulaire avec les sources
                new SearchForm(sources);
            }
        });

    // Détecte la soumission du formulaire d'inscription
    formRegister.addEventListener('submit', e => {
        e.preventDefault();

        // Si le mot de passe et sa confirmation sont identiques
        if(inputRegisterPassword.value === inputRegisterPasswordConfirm.value) {

            // Inscription
            register();

        } else {
            showInvalidInput(inputRegisterPasswordConfirm, 'Mot de passe différent')
        }
    });

    // Détecte la soumission du formulaire de connexion
    formLogin.addEventListener('submit', e => {
        e.preventDefault();

        // Connexion
        login();
    });

    // Déconnexion d l'utilisateur
    document.querySelector('.logout').addEventListener('click', e => {
        e.preventDefault();
        logout();
    });

    // Afficher les articles récemment vues
    displayRecentlyViewed();

});



