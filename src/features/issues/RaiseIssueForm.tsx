import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { AccessibilityInfo, Image, Pressable, View } from 'react-native';

import { Button, Card, Input, makeStyles, Text, useTheme } from '@/design-system';
import type { DemoAccountId } from '@/features/auth/types';
import { isLogsApiError, useRaiseIssueMutation } from '@/features/logs/logsApi';
import { usePhotoPicker } from '@/features/camera/usePhotoPicker';

import { issueCategories, issueCategoryOrder, issueDraftError } from './issueCategories';
import type { IssueCategory } from './types';

/** Pick a preset high-priority kind, or Other and write it in, then flag it. */
export function RaiseIssueForm({
  accountId,
  sourceLogId,
  onDone,
}: {
  accountId: DemoAccountId;
  sourceLogId: string | null;
  onDone: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const [raiseIssue, result] = useRaiseIssueMutation();
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [details, setDetails] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const picker = usePhotoPicker((uris) =>
    setPhotoUris((current) => [...current, ...uris].slice(0, 5)),
  );
  const other = category === 'other';

  const submit = async () => {
    const invalid = issueDraftError(category, details);
    if (invalid || !category) {
      setDraftError(invalid);
      return;
    }
    setDraftError(null);
    try {
      await raiseIssue({ category, details, sourceLogId, accountId, photoUris }).unwrap();
      AccessibilityInfo.announceForAccessibility('Issue flagged');
      onDone();
    } catch {
      // The message renders below; the draft stays for retry.
    }
  };

  return (
    <Card testID="raise-issue-form">
      <Text variant="title">Flag a high-priority issue</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {issueCategoryOrder.map((key) => {
          const selected = category === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                setCategory(key);
                setDraftError(null);
              }}
              accessibilityRole="radio"
              accessibilityLabel={issueCategories[key].label}
              aria-checked={selected}
              testID={`issue-category-${key}`}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={issueCategories[key].icon}
                size={theme.fontSize.base}
                color={selected ? theme.color.error : theme.color.textMuted}
              />
              <Text variant="bodySm" weight={selected ? 'semibold' : 'medium'}>
                {issueCategories[key].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {category ? (
        <Input
          label={other ? 'Describe the issue' : 'Details'}
          value={details}
          onChangeText={setDetails}
          placeholder={other ? 'What needs attention?' : 'Where, what, and anything already done'}
          {...(other ? {} : { helperText: 'Optional' })}
          {...(draftError === 'Describe the issue.' ? { error: draftError } : {})}
          multiline
          testID="raise-issue-details"
        />
      ) : null}

      <View style={styles.photoSection}>
        <Text variant="bodySm" weight="semibold">
          Evidence photos {category === 'safety' ? '(required)' : '(optional)'}
        </Text>
        <View style={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => void picker.takePhoto()}
            disabled={picker.busy || photoUris.length >= 5}
            accessibilityLabel="Take an evidence photo"
          >
            Camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => void picker.choosePhotos()}
            disabled={picker.busy || photoUris.length >= 5}
            accessibilityLabel="Choose evidence photos"
            testID="raise-issue-choose-photos"
          >
            Choose photos
          </Button>
        </View>
        {photoUris.length > 0 ? (
          <View style={styles.thumbnails}>
            {photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.thumbnailWrap}>
                <Image
                  source={{ uri }}
                  style={styles.thumbnail}
                  accessibilityLabel={`Evidence photo ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    setPhotoUris((items) => items.filter((_, itemIndex) => itemIndex !== index))
                  }
                  accessibilityLabel={`Remove evidence photo ${index + 1}`}
                >
                  Remove
                </Button>
              </View>
            ))}
          </View>
        ) : null}
        {picker.error ? (
          <Text variant="caption" tone="error">
            {picker.error.message}
          </Text>
        ) : null}
        {category === 'safety' && photoUris.length === 0 ? (
          <Text variant="caption" tone="muted">
            Add at least one photo to flag a Safety hazard.
          </Text>
        ) : null}
      </View>

      {draftError && draftError !== 'Describe the issue.' ? (
        <Text variant="bodySm" tone="error" weight="semibold" testID="raise-issue-error">
          {draftError}
        </Text>
      ) : null}
      {result.isError ? (
        <Text variant="bodySm" tone="error" weight="semibold" testID="raise-issue-error">
          {isLogsApiError(result.error)
            ? result.error.data.message
            : 'The issue could not be flagged. Try again.'}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          onPress={onDone}
          disabled={result.isLoading}
          accessibilityLabel="Cancel flagging an issue"
          testID="raise-issue-cancel"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onPress={() => void submit()}
          loading={result.isLoading}
          accessibilityLabel="Flag issue"
          testID="raise-issue-submit"
        >
          Flag issue
        </Button>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  option: {
    minHeight: t.size.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    paddingHorizontal: t.spacing[3],
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.full,
    backgroundColor: t.color.surface,
  },
  optionSelected: { borderColor: t.color.error, backgroundColor: t.color.errorBg },
  pressed: { opacity: t.opacity.pressed },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing[2] },
  photoSection: { gap: t.spacing[2] },
  thumbnails: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  thumbnailWrap: { gap: t.spacing[1], alignItems: 'center' },
  thumbnail: {
    width: t.spacing[16],
    height: t.spacing[16],
    borderRadius: t.radius.sm,
    backgroundColor: t.color.bgSubtle,
  },
}));
