import { CSSProperties, ReactNode, ReactText } from 'react';

/**
 * Internal dependencies
 */
import { Props as ControlLabelProps } from '../control-label/types';
import { Props as GridProps } from '../grid/types';

export type FormGroupLabelProps = ControlLabelProps & {
	labelHidden?: boolean;
	id?: ReactText;
};

export type FormGroupContentProps = FormGroupLabelProps & {
	alignLabel?: CSSProperties[ 'textAlign' ];
	help?: ReactNode;
	horizontal?: boolean;
	label?: ReactNode;
	spacing?: CSSProperties[ 'width' ];
	truncate?: boolean;
};

type Horizontal = GridProps & {
	horizontal: true;
};

type Vertical = { horizontal: false };

export type FormGroupProps = FormGroupContentProps & ( Horizontal | Vertical );
