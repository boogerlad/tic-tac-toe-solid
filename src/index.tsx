import { createState, batch, createMemo } from 'solid-js';
import { render, For, Switch, Match } from 'solid-js/dom';
import './index.css';

render(
	function() {
		const [state, setState] = createState({
			board: [
				[{v: null, c: ''}, {v: null, c: ''}, {v: null, c: ''}],
				[{v: null, c: ''}, {v: null, c: ''}, {v: null, c: ''}],
				[{v: null, c: ''}, {v: null, c: ''}, {v: null, c: ''}]
			],
			get player() {
				let x = 0;
				let o = 0;
				for(let i = 0; i < state.board.length; ++i) {
					for(let j = 0; j < state.board[i].length; ++j) {
						if(state.board[i][j].v) {
							++x;
						} else if(state.board[i][j].v === false) {
							++o;
						}
					}
				}
				let diff = Math.abs(x - o);
				if(diff > 1) {
					setState('board', {}, {}, 'v', null);
				}
				return diff === 0;
			}
		});
		const status = createMemo(() => {
			console.log('yool')
			row: for(let i = 0; i < state.board.length; ++i) {
				let p = state.board[i][0].v;
				if(p !== null) {
					for(let j = 1; j < state.board[i].length; ++j) {
						if(p !== state.board[i][j].v) {
							continue row;
						}
					}
					batch(() => {
						for(let k = 0; k < state.board.length; ++k) {
							for(let l = 0; l < state.board[k].length; ++l) {
								setState('board', k, l, 'c', i === k ? 'row' : '');
							}
						}
					});
					return true;
				}
			}
			column: for(let i = 0; i < state.board.length; ++i) {
				let p = state.board[0][i].v;
				if(p !== null) {
					for(let j = 1; j < state.board[i].length; ++j) {
						if(p !== state.board[j][i].v) {
							continue column;
						}
					}
					batch(() => {
						for(let k = 0; k < state.board.length; ++k) {
							for(let l = 0; l < state.board[k].length; ++l) {
								setState('board', k, l, 'c', i === l ? 'column' : '');
							}
						}
					});
					return true;
				}
			}
			let p = state.board[0][0].v;
			if(p !== null) {
				let win = true;
				for(let i = 1; i < state.board.length; ++i) {
					if(p !== state.board[i][i].v) {
						win = false;
						break;
					}
				}
				if(win) {
					batch(() => {
						for(let k = 0; k < state.board.length; ++k) {
							for(let l = 0; l < state.board[k].length; ++l) {
								setState('board', k, l, 'c', k === l ? 'downDiagonal' : '');
							}
						}
					});
					return true;
				}
			}
			p = state.board[state.board.length - 1][0].v;
			if(p !== null) {
				let win = true;
				for(let i = 1; i < state.board.length; ++i) {
					if(p !== state.board[state.board.length - 1 - i][i].v) {
						win = false;
						break;
					}
				}
				if(win) {
					batch(() => {
						for(let k = 0; k < state.board.length; ++k) {
							for(let l = 0; l < state.board[k].length; ++l) {
								setState('board', k, l, 'c', state.board.length - 1 - k === l ? 'upDiagonal' : '');
							}
						}
					});
					return true;
				}
			}
			batch(() => {
				for(let k = 0; k < state.board.length; ++k) {
					for(let l = 0; l < state.board[k].length; ++l) {
						setState('board', k, l, 'c', '');
					}
				}
			});
			for(let i = 0; i < state.board.length; ++i) {
				for(let j = 0; j < state.board[i].length; ++j) {
					if(state.board[i][j].v === null) {
						return false;
					}
				}
			}
			return null;
		}, false, true);
		return <>
			<label>length <input type="number" min="1" step="1" value={state.board.length} onChange={e => {
				let newLength = Number(e.target.value);
				let oldLength = state.board.length;
				batch(() => {
					setState('board', 'length', newLength);
					if(newLength > oldLength) {
						setState('board', { from: 0, to: oldLength - 1 }, 'length', newLength);
						setState('board', { from: 0, to: oldLength - 1 }, { from: oldLength, to: newLength - 1}, rc => ({v: null, c: ''}));//need to be functional form, otherwise share same reference across all!
						setState('board', { from: oldLength, to: newLength - 1}, Array(newLength));
						setState('board', { from: oldLength, to: newLength - 1}, {}, rc => ({v: null, c: ''}));
					} else {
						setState('board', { from: 0, to: newLength - 1 }, 'length', newLength);
					}
				});
			}} /></label><br />
			<Switch>
				<Match when={status()}>game over</Match>
				<Match when={status() === false}>player {state.player ? 'X' : 'O'}'s turn</Match>
				<Match when={status() === null}>tie</Match>
			</Switch>
			<button type="button" onClick={() => setState('board', {}, {}, 'v', null)}>new game</button>
			<table>
				<For each={state.board}>{(row, i) => <tr>
					<For each={state.board[i()]}>{(column, j) => <td class={column.c} onClick={() => {
						if(column.v === null && status() === false) {
							setState('board', i(), j(), 'v', state.player)
						}
					}}>
						{column.v ? 'X' : column.v === false ? 'O' : '\u00A0'}
					</td>}</For>
				</tr>}</For>
			</table>
		</>
	},
	document.body as Node
);

/* todo:
write immer variant
tests
document where rerendering is minimized :)
	if column is null, onClick will rerender the entire thing(easy to see with {Date.now()})
	if column is {v: null}, onClick won't rerender the entire thing since referential equality is still true
	with memo, won't run status if clicked on ✔️ and ❌ is null. there are other cases where status won't be run but lazy to explain.
	point is solid's dependency tracking is great for reducing work
	❌ ❌ ❌
	❌ ✔️ ✔️
	❌ ✔️ ✔️
*/