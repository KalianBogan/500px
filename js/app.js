var App = React.createClass({
  getInitialState: function () {
    return {
      visible: false,
      src: '',
      marginTop: ''
    };
  },
  listClickHeandler: function(e) {
    var key = e.target.closest('li').getAttribute('data-reactid');
    var startItem = key.indexOf('$') + 1;
    key = key.split('');
    var id = key.splice( startItem ).join('');
    this.getLargePhoto(id);
  },
  toggleVissibility: function () {
    this.setState({
      visible: !this.state.visible
    });
  },
  setMarginTop: function() {
    this.setState({marginTop: pageYOffset});
  },
  getLargePhoto: function(id) {
    var url = 'https://api.500px.com/v1/photos/'+id+'?consumer_key=wB4ozJxTijCwNuggJvPGtBGCRqaZVcF6jsrzUadF';
    var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
    var xhr = new XHR();
      
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application');
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      this.setState({src: data.photo.image_url});
      this.setMarginTop();
      this.toggleVissibility();
    }.bind(this);
    xhr.onerror = function() {
      console.log( 'Ошибка ' + this.status );
    }
    xhr.send();
  },
  
  render: function() {    
    return (
      <div 
        className='app'
      >
        <LargeImg
          options={ this.state }
          toggleVissibility={ this.toggleVissibility } 
        />
        <Thumbs
          options={ this.state }
          listClickHeandler={ this.listClickHeandler } 
        />
      </div>
    );
  }
});

var Thumbs = React.createClass({
  getInitialState: function() {
    return {
      dataArr: '',
      page: 1,
      isDataLoading: 0
    };
  },
  
  setData: function(data) {
    this.setState({ dataArr: data });
    this.setState({isDataLoading: 0});
  },
  
  addData: function(newData) {
    var data = this.state.dataArr.slice();
    newData.forEach(function(item){
      data.push(item);
    });
    this.setState({dataArr: data});
    this.setState({isDataLoading: 0});
  },
  
  getData: function() {
    var page = '&page=' + this.state.page;
    
    var url = 'https://api.500px.com/v1/photos?feature=popular&consumer_key=wB4ozJxTijCwNuggJvPGtBGCRqaZVcF6jsrzUadF' + page;
    var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
    var xhr = new XHR();
      
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application');
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      var data = data.photos;
      
      if ( this.state.page === 1) {
        this.setData(data);
        return false;
      }
      
      this.addData(data);
    }.bind(this);
    xhr.onerror = function() {
      console.log( 'Ошибка ' + this.status );
    }
    xhr.send();
  },
  
  onScrollHeandler: function() {
    if ( this.state.page === 1 ) return false;
    if (this.state.isDataLoading) return false;
    
    var toTop = pageYOffset + window.innerHeight;
    
    var scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    
    if ( scrollHeight === toTop ) {
      this.setState({ page: this.state.page + 1 });
      this.getData();
    }
    return false;
  },
  
  moreOnClickHeandler: function(e){
    e.preventDefault();
    if (this.state.isDataLoading) return false;
    this.setState({isDataLoading: 1});
    this.setState({ page: this.state.page + 1 });
    setTimeout(function(){
      this.getData();
    }.bind(this), 1);
    
    document.querySelector('.loadMore').remove();
  },
  
  createListItem: function(photo) {
    return (
      <li
        key={ photo.id }
        onClick={ this.props.listClickHeandler }
      >
        <img src={ photo.image_url } />
        <span className="thumbs__author">{ photo.user.fullname }</span>
        <span className="thumbs__name">{ photo.name }</span>
      </li>
    );
  },
    
  render: function () {
    document.addEventListener('scroll', this.onScrollHeandler);
    
    if (!this.state.dataArr) this.getData();
    var arr = (this.state.dataArr) ? this.state.dataArr : [];
    
    return ( 
      <div className = "thumbs">
        <ul>
          { arr.map(this.createListItem) }
        </ul>
        < MoreButton 
          moreOnClickHeandler={this.moreOnClickHeandler}
        />
      </div>
    );
  }
});

var MoreButton = React.createClass({
  render: function() {
    return (
      <a 
        href=""
        className="loadMore"
        onClick={ this.props.moreOnClickHeandler }
      >
        Больше фото
      </a>
    );
  }
});

var LargeImg = React.createClass({
  close: function(e) {
    if ( e.target.hasAttribute('src') ) return false;
    this.props.toggleVissibility();
  },
  render: function () {
    var classNameVisibility = (this.props.options.visible) ? 'visible' : '';
    return (
      < div 
        onClick={ this.close }
        className = { "largeImg " + classNameVisibility }
      >
        <img 
          src={ this.props.options.src }
          style={{marginTop: this.props.options.marginTop + 40 + 'px'}}
        />
      </div>
    );
  }
});

ReactDOM.render( < App / > , document.getElementById('root'));

