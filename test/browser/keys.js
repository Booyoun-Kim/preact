import { h, Component, render } from '../../src/preact';
/** @jsx h */

describe('keys', () => {
	let scratch;

	before( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	after( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

	// See developit/preact-compat#21
	it('should remove orphaned keyed nodes', () => {
		let root = render((
			<div>
				<div>1</div>
				<li key="a">a</li>
			</div>
		), scratch);

		root = render((
			<div>
				<div>2</div>
				<li key="b">b</li>
			</div>
		), scratch, root);

		expect(scratch.innerHTML).to.equal('<div><div>2</div><li>b</li></div>');
	});

	it('should set VNode#key property', () => {
		expect(<div />).to.have.property('key').that.is.empty;
		expect(<div a="a" />).to.have.property('key').that.is.empty;
		expect(<div key="1" />).to.have.property('key', '1');
	});

	it('should remove keyed nodes (#232)', () => {
		class App extends Component {
			componentDidMount() {
				setTimeout(() => this.setState({opened: true,loading: true}), 10);
				setTimeout(() => this.setState({opened: true,loading: false}), 20);
			}

			render({ opened, loading }) {
				return (
					<BusyIndicator id="app" busy={loading}>
						<div>This div needs to be here for this to break</div>
						{ opened && !loading && <div>{[]}</div> }
					</BusyIndicator>
				);
			}
		}

		class BusyIndicator extends Component {
			render({ children, busy }) {
				return <div class={busy ? "busy" : ""}>
					{ children && children.length ? children : <div class="busy-placeholder"></div> }
					<div class="indicator">
						<div>indicator</div>
						<div>indicator</div>
						<div>indicator</div>
					</div>
				</div>;
			}
		}

		let root;

		root = render(<App />, scratch, root);
		root = render(<App opened loading />, scratch, root);
		root = render(<App opened />, scratch, root);

		expect(root).to.have.property('innerHTML', '<div>This div needs to be here for this to break</div><div class=""></div><div class="indicator"><div>indicator</div><div>indicator</div><div>indicator</div></div>');
	});
});
