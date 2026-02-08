/**
 * A reusable toggle switch component.
 *
 * @since [NEXT_VERSION]
 *
 * @param {Object}   props
 * @param {boolean}  props.checked  Whether the toggle is on.
 * @param {Function} props.onChange Callback when toggled.
 * @param {boolean}  props.disabled Whether the toggle is disabled.
 * @return {JSX.Element} Toggle switch element.
 */
const ToggleSwitch = ( { checked = false, onChange, disabled = false } ) => {
	const handleClick = () => {
		if ( disabled ) return

		onChange( !checked )
	}

	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			className={`toggle-switch${ checked ? ' toggle-switch--on' : '' }${ disabled ? ' toggle-switch--disabled' : '' }`}
			onClick={handleClick}
			disabled={disabled}
		>
			<span className="toggle-switch__track">
				<span className="toggle-switch__thumb" />
			</span>
		</button>
	)
}

export default ToggleSwitch

