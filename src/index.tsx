import { createState, batch } from 'solid-js';
import { render, For } from 'solid-js/dom';
import './index.css';

render(
	function() {
		const [state, setState] = createState({
			board: [
				[null, null, null],
				[null, null, null],
				[null, null, null]
			],
			get player() {
				let x = 0;
				let o = 0;
				for(let i = 0; i < state.board.length; ++i) {
					for(let j = 0; j < state.board[i].length; ++j) {
						if(state.board[i][j]) {
							++x;
						} else if(state.board[i][j] === false) {
							++o;
						}
					}
				}
				let diff = Math.abs(x - o);
				if(diff > 1) {
					setState('board', {}, {}, null);
				}
				return diff === 0;
			},
			get status() {
				row: for(let i = 0; i < state.board.length; ++i) {
					let p = state.board[i][0];
					if(p !== null) {
						for(let j = 1; j < state.board[i].length; ++j) {
							if(p !== state.board[i][j]) {
								continue row;
							}
						}
						return {
							winner: p,
							how: 'row',
							where: i
						}
					}
				}
				column: for(let i = 0; i < state.board.length; ++i) {
					let p = state.board[0][i];
					if(p !== null) {
						for(let j = 1; j < state.board[i].length; ++j) {
							if(p !== state.board[j][i]) {
								continue column;
							}
						}
						return {
							winner: p,
							how: 'column',
							where: i
						}
					}
				}
				let p = state.board[0][0];
				if(p !== null) {
					let win = true;
					for(let i = 1; i < state.board.length; ++i) {
						if(p !== state.board[i][i]) {
							win = false;
							break;
						}
					}
					if(win) {
						return {
							winner: p,
							how: 'diagonal',
							where: 0
						}
					}
				}
				p = state.board[state.board.length - 1][0];
				if(p !== null) {
					let win = true;
					for(let i = 1; i < state.board.length; ++i) {
						if(p !== state.board[state.board.length - 1 - i][i]) {
							win = false;
							break;
						}
					}
					if(win) {
						return {
							winner: p,
							how: 'diagonal',
							where: state.board.length - 1
						}
					}
				}
				return null;
			}
		});
		return <>
			<label>length <input type="number" min="1" step="1" value={state.board.length} onChange={e => {
				let newLength = Number(e.target.value);
				let oldLength = state.board.length;
				batch(() => {
					setState('board', 'length', newLength);
					if(newLength > oldLength) {
						setState('board', { from: 0, to: oldLength - 1 }, 'length', newLength);
						setState('board', { from: 0, to: oldLength - 1 }, { from: oldLength, to: newLength - 1}, null);
						setState('board', { from: oldLength, to: newLength - 1}, Array(newLength).fill(null));
					} else {
						setState('board', { from: 0, to: newLength - 1 }, 'length', newLength);
					}
				});
			}} /></label><br />
			{state.status ? 'game over' : `player ${state.player ? 'X' : 'O'}'s turn`}
			<button type="button" onClick={() => setState('board', {}, {}, null)}>new game</button>
			<table>
				<For each={state.board}>{(row: Array<boolean | null>, i) => <tr>
					<For each={state.board[i()]}>{(column: boolean | null, j) => <td class={(() => {
						switch(state.status?.how) {
							case 'row':
								if(i() === state.status.where) {
									return 'row';
								}
								break;
							case 'column':
								if(j() === state.status.where) {
									return 'column';
								}
								break;
							case 'diagonal':
								if(state.status.where === 0) {
									if(i() === j()) {
										return 'downDiagonal';
									}
								} else {
									if(state.board.length - 1 - i() === j()) {
										return 'upDiagonal';
									}
								}
						}
						return '';
					})()} onClick={() => {
						if(column === null && state.status === null) {
							setState('board', i(), j(), state.player)
						}
					}}>
						{column ? 'X' : column === false ? 'O' : '\u00A0'}
					</td>}</For>
				</tr>}</For>
			</table>
		</>
	},
	document.body as Node
);