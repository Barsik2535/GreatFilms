class HelloWorld extends React.Component {
    render() {
        return (<h1>My First ReactJS Core App!</h1>);
    }
}
ReactDOM.render(
    <HelloWorld />,
    document.getElementById('dvMessage')
); 