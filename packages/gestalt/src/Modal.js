// @flow strict
import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  type Node,
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ESCAPE } from './keyCodes.js';
import Box from './Box.js';
import Backdrop from './Backdrop.js';
import focusStyles from './Focus.css';
import Heading from './Heading.js';
import StopScrollBehavior from './behaviors/StopScrollBehavior.js';
import TrapFocusBehavior from './behaviors/TrapFocusBehavior.js';
import modalStyles from './Modal.css';

type Props = {|
  accessibilityModalLabel: string,
  children?: Node,
  closeOnOutsideClick?: boolean,
  footer?: Node,
  heading?: string | Node,
  onDismiss: () => void,
  role?: 'alertdialog' | 'dialog',
  size?: 'sm' | 'md' | 'lg' | number,
|};

const SIZE_WIDTH_MAP = {
  sm: 540,
  md: 720,
  lg: 900,
};

function Header({ heading }: {| heading: string | Node |}) {
  if (typeof heading !== 'string') {
    return heading;
  }

  return (
    <Box display="flex" justifyContent="center" paddingY={4} paddingX={8}>
      <Heading size="md" accessibilityLevel={1}>
        {heading}
      </Heading>
    </Box>
  );
}

const ModalWithForwardRef: React$AbstractComponent<
  Props,
  HTMLDivElement
> = forwardRef<Props, HTMLDivElement>(function Modal(props, ref): Node {
  const {
    accessibilityModalLabel,
    children,
    closeOnOutsideClick = true,
    onDismiss,
    footer,
    heading,
    role = 'dialog',
    size = 'sm',
  } = props;

  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const content = useRef<?HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyUp(event: {| keyCode: number |}) {
      if (event.keyCode === ESCAPE) {
        onDismiss();
      }
    }

    window.addEventListener('keyup', handleKeyUp);
    return function cleanup() {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onDismiss]);

  const handleOutsideClick = () => {
    if (closeOnOutsideClick) {
      onDismiss();
    }
  };

  const updateShadows = () => {
    const target = content.current;
    if (!target) {
      return;
    }
    const hasVerticalScrollbar = target.clientHeight < target.scrollHeight;
    setShowTopShadow(hasVerticalScrollbar && target.scrollTop > 0);
    setShowBottomShadow(
      hasVerticalScrollbar &&
        target.offsetHeight + target.scrollTop < target.scrollHeight
    );
  };

  useEffect(() => {
    window.addEventListener('resize', updateShadows);
    return () => {
      window.removeEventListener('resize', updateShadows);
    };
  }, []);

  useEffect(() => {
    updateShadows();
  }, []);

  const width = typeof size === 'string' ? SIZE_WIDTH_MAP[size] : size;

  return (
    <StopScrollBehavior>
      <TrapFocusBehavior>
        <div
          aria-label={accessibilityModalLabel}
          className={modalStyles.container}
          role={role}
        >
          <Backdrop
            closeOnOutsideClick={closeOnOutsideClick}
            onClick={handleOutsideClick}
          >
            <div
              className={classnames(
                modalStyles.wrapper,
                focusStyles.hideOutline
              )}
              tabIndex={-1}
              style={{ width }}
              ref={ref}
            >
              <Box
                flex="grow"
                position="relative"
                display="flex"
                direction="column"
                width="100%"
                padding={4}
              >
                {heading && (
                  <div
                    className={classnames(modalStyles.shadowContainer, {
                      [modalStyles.shadow]: showTopShadow,
                    })}
                  >
                    <Header heading={heading} />
                  </div>
                )}
                <Box
                  flex="grow"
                  overflow="auto"
                  onScroll={updateShadows}
                  ref={content}
                  marginTop={4}
                >
                  {children}
                </Box>
                {footer && (
                  <div
                    className={classnames(modalStyles.shadowContainer, {
                      [modalStyles.shadow]: showBottomShadow,
                    })}
                  >
                    <Box padding={8}>{footer}</Box>
                  </div>
                )}
              </Box>
            </div>
          </Backdrop>
        </div>
      </TrapFocusBehavior>
    </StopScrollBehavior>
  );
});

// $FlowFixMe[prop-missing] flow 0.135.0 upgrade
ModalWithForwardRef.propTypes = {
  accessibilityModalLabel: PropTypes.string.isRequired,
  children: PropTypes.node,
  closeOnOutsideClick: PropTypes.bool,
  footer: PropTypes.node,
  heading: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onDismiss: PropTypes.func,
  role: PropTypes.oneOf(['alertdialog', 'dialog']),
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['sm', 'md', 'lg']),
  ]),
};

ModalWithForwardRef.displayName = 'Modal';

export default ModalWithForwardRef;
