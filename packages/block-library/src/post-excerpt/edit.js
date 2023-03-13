/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { useMemo } from '@wordpress/element';
import {
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	RichText,
	Warning,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl, RangeControl } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useCanEditEntity } from '../utils/hooks';

export default function PostExcerptEditor( {
	attributes: {
		textAlign,
		moreText,
		showMoreOnNewLine,
		excerptLength,
		previewPlaceholder,
	},
	setAttributes,
	isSelected,
	context: { postId, postType, queryId },
} ) {
	const isDescendentOfQueryLoop = Number.isFinite( queryId );
	const userCanEdit = useCanEditEntity( 'postType', postType, postId );
	const isEditable = userCanEdit && ! isDescendentOfQueryLoop;

	const [
		rawExcerpt,
		setExcerpt,
		{ rendered: renderedExcerpt, protected: isProtected } = {},
	] = useEntityProp( 'postType', postType, 'excerpt', postId );
	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	/**
	 * translators: If your word count is based on single characters (e.g. East Asian characters),
	 * enter 'characters_excluding_spaces' or 'characters_including_spaces'. Otherwise, enter 'words'.
	 * Do not translate into your own language.
	 */
	const wordCountType = _x( 'words', 'Word count type. Do not translate!' );

	/**
	 * When excerpt is editable, strip the html tags from
	 * rendered excerpt. This will be used if the entity's
	 * excerpt has been produced from the content.
	 */
	const strippedRenderedExcerpt = useMemo( () => {
		if ( ! renderedExcerpt ) return '';
		const document = new window.DOMParser().parseFromString(
			renderedExcerpt,
			'text/html'
		);
		return document.body.textContent || document.body.innerText || '';
	}, [ renderedExcerpt ] );
	if ( ! postType || ! postId ) {
		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( newAlign ) =>
							setAttributes( { textAlign: newAlign } )
						}
					/>
				</BlockControls>
				<div { ...blockProps }>
					<p>
						{ previewPlaceholder
							? previewPlaceholder
							: __(
									'This is the Post Excerpt block, it will display the excerpt'
							  ) }
					</p>
				</div>
			</>
		);
	}
	if ( isProtected && ! userCanEdit ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __(
						'There is no excerpt because this is a protected post.'
					) }
				</Warning>
			</div>
		);
	}
	const readMoreLink = (
		<RichText
			className="wp-block-post-excerpt__more-link"
			tagName="a"
			aria-label={ __( '“Read more” link text' ) }
			placeholder={ __( 'Add "read more" link text' ) }
			value={ moreText }
			onChange={ ( newMoreText ) =>
				setAttributes( { moreText: newMoreText } )
			}
			withoutInteractiveFormatting={ true }
		/>
	);
	const excerptClassName = classnames( 'wp-block-post-excerpt__excerpt', {
		'is-inline': ! showMoreOnNewLine,
	} );

	/**
	 * The excerpt length setting needs to be applied to both
	 * the raw and the rendered excerpt depending on which is being used.
	 */
	const rawOrRenderedExcerpt = !! renderedExcerpt
		? strippedRenderedExcerpt
		: rawExcerpt;

	let trimmedExcerpt = '';
	if ( wordCountType === 'words' ) {
		trimmedExcerpt = rawOrRenderedExcerpt
			.trim()
			.split( ' ', excerptLength )
			.join( ' ' );
	} else if ( wordCountType === 'characters_excluding_spaces' ) {
		/*
		 * 1. Split the excerpt at the character limit,
		 * then join the substrings back into one string.
		 * 2. Count the number of spaces in the excerpt
		 * by comparing the lengths of the string with and without spaces.
		 * 3. Add the number to the length of the visible excerpt,
		 * so that the spaces are excluded from the word count.
		 */
		const excerptWithSpaces = rawOrRenderedExcerpt
			.trim()
			.split( '', excerptLength )
			.join( '' );

		const numberOfSpaces =
			excerptWithSpaces.length -
			excerptWithSpaces.replaceAll( ' ', '' ).length;

		trimmedExcerpt = rawOrRenderedExcerpt
			.trim()
			.split( '', excerptLength + numberOfSpaces )
			.join( '' );
	} else if ( wordCountType === 'characters_including_spaces' ) {
		trimmedExcerpt = rawOrRenderedExcerpt.trim().split( '', excerptLength );
	}

	trimmedExcerpt = trimmedExcerpt + '...';

	const excerptContent = isEditable ? (
		<RichText
			className={ excerptClassName }
			aria-label={ __( 'Post excerpt text' ) }
			value={
				isSelected
					? rawOrRenderedExcerpt
					: ( trimmedExcerpt !== '...' ? trimmedExcerpt : '' ) ||
					  __( 'No post excerpt found' )
			}
			onChange={ setExcerpt }
			tagName="p"
		/>
	) : (
		<p className={ excerptClassName }>
			{ trimmedExcerpt !== '...'
				? trimmedExcerpt
				: __( 'No post excerpt found' ) }
		</p>
	);
	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ ( newAlign ) =>
						setAttributes( { textAlign: newAlign } )
					}
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show link on new line' ) }
						checked={ showMoreOnNewLine }
						onChange={ ( newShowMoreOnNewLine ) =>
							setAttributes( {
								showMoreOnNewLine: newShowMoreOnNewLine,
							} )
						}
					/>
					<RangeControl
						label={ __( 'Max number of words' ) }
						value={ excerptLength }
						onChange={ ( value ) => {
							setAttributes( { excerptLength: value } );
							setExcerpt();
						} }
						min="10"
						max="100"
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ excerptContent }
				{ ! showMoreOnNewLine && ' ' }
				{ showMoreOnNewLine ? (
					<p className="wp-block-post-excerpt__more-text">
						{ readMoreLink }
					</p>
				) : (
					readMoreLink
				) }
			</div>
		</>
	);
}
