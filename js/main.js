var NUMBER_OF_SEARCH_RESULTS = 7;

var Movie = React.createClass({displayName: "Movie",
    onMovieSelection: function(e) {
        e.preventDefault();
        this.props.onMovieSelection(this.props.movie);
    },

    render: function() {
        return React.createElement("li", null, 
            React.createElement("a", {href: "#", onClick: this.onMovieSelection}, 
                React.createElement("img", {src: this.props.movie.cover, alt: "cover"}), 
                React.createElement("span", null, this.props.movie.title), 
                React.createElement("p", null, this.props.movie.year)
            )
        )
    }
});

var MovieResults = React.createClass({displayName: "MovieResults",
    render: function() {
        var regex = new RegExp(this.props.filter, "i");

        var entries = [];
        for (i = 0; i < movies.length; i++) {
            if (movies[i].title.search(regex) >= 0) {
                entries.push(React.createElement(Movie, {key: movies[i].info_hash, movie: movies[i], onMovieSelection: this.props.onMovieSelection}));
                if (entries.length >= NUMBER_OF_SEARCH_RESULTS) break;
            }
        }

        return React.createElement("ul", {className: "results"}, 
            entries
        )
    }
});

var SearchBox = React.createClass({displayName: "SearchBox",
    onChange: function(e) {
        this.props.onChange(e.target.value);
    },

    handleSubmit: function(e) {
        e.preventDefault();
    },

    render: function() {
        return React.createElement("div", {className: "search"}, 
            React.createElement("label", {htmlFor: "term"}, "Search: "), 
            React.createElement("form", {onSubmit: this.handleSubmit}, 
                React.createElement("input", {id: "term", onChange: this.onChange, value: this.props.filter, autoFocus: true})
            )
        )
    }
});

var MovieSelection = React.createClass({displayName: "MovieSelection",
    getInitialState: function() {
        return {filter: ''};
    },

    setFilter: function(filter) {
        this.setState({filter: filter});
    },

    render: function() {
        return React.createElement("div", {id: "movie-selection"}, 
            React.createElement(SearchBox, {onChange: this.setFilter, filter: this.state.filter}), 
            React.createElement(MovieResults, {movies: this.props.movies, filter: this.state.filter, onMovieSelection: this.props.onMovieSelection})
        )
    }
});

var ProgressBar = React.createClass({displayName: "ProgressBar",
    getInitialState: function() {
        return {progress: 0, timestamp: new Date()};
    },

    tick: function() {
        var now = new Date();
        var elapsedMilliseconds = now.getTime() - this.state.timestamp.getTime()

        var newProgress = elapsedMilliseconds * 0.001;
        if (newProgress > 100) newProgress = 100;

        this.setState({progress: newProgress});
        if (newProgress == 100) {
            clearInterval(this.interval);
            this.props.onCompletion();
        }
    },

    componentDidMount: function() {
        this.interval = setInterval(this.tick, 200);
    },

    componentWillUnmount: function() {
        clearInterval(this.interval);
    },

    getMessage: function() {
        if (this.state.progress > 99) return "";
        if (this.state.progress > 90) return "And hope for the best. Here we go...";
        if (this.state.progress > 80) return "We are just giving the video widget a bit of time...";
        if (this.state.progress > 70) return "Actually, this progress bar is just smoke and mirrors...";
        if (this.state.progress > 20) return "Waiting for video buffer to fill...";
        return "Requesting torrent from server...";
    },

    render: function() {
        var progressBarStyle = { width: this.state.progress + "%" };
        var message = this.getMessage();

        return React.createElement("div", {id: "progress"}, 
            React.createElement("div", {className: "progress"}, 
                React.createElement("div", {id: "status-percentage", className: "progress-bar progress-bar-success", role: "progressbar", "aria-valuenow": this.state.progress, "aria-valuemin": "0", "aria-valuemax": "100", style: progressBarStyle}, 
                    React.createElement("span", {id: "status-percentage-text"}, message)
                )
            )
        )
    }
});

var Screen = React.createClass({displayName: "Screen",
    getInitialState: function() {
        return {videoPseudoReady: false};
    },

    onCompletion: function() {
        this.setState({videoPseudoReady: true});
        document.getElementById('video').play();
    },

    onBackButton: function(e) {
        e.preventDefault();
        this.props.onBackButton();
    },

    render: function() {
        var progress = 25;
        var progressBarStyle = { width: progress + "%" };

        return React.createElement("div", {id: "screen"}, 
            React.createElement("video", {id: "video", controls: true}, 
                React.createElement("source", {src: this.props.url})
            ), 
            this.state.videoPseudoReady ? "" : React.createElement(ProgressBar, {onCompletion: this.onCompletion}), 
            React.createElement("a", {href: "#", onClick: this.onBackButton}, React.createElement("img", {id: "back", src: "images/home.png", alt: "home"}))
        )
    }
});

var App = React.createClass({displayName: "App",
    getInitialState: function() {
        return {movie: null};
    },

    onMovieSelection: function(movie) {
        this.setState({movie: movie});
    },

    onBackButton: function() {
        this.setState({movie: null});
    },

    render: function() {
        if (this.state.movie == null) {
            return React.createElement(MovieSelection, {movies: this.props.movies, onMovieSelection: this.onMovieSelection})
        } else {
            var url = 'https://coinado.io/i/' + this.state.movie.info_hash + '/auto';
            return React.createElement(Screen, {url: url, onBackButton: this.onBackButton})
        }
    }
});

React.render(React.createElement(App, {movies: movies}), document.getElementById('content'));
