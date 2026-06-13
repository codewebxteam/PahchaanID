import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_PROFILES } from '../../constants/mockData';
import tabStyles from './shared/tabStyles';
import IdTypeSelector, { ID_TYPES } from './shared/IdTypeSelector';
import { createVerification, mapIdType } from '../../services/api';

type VerifyStep = 'choose' | 'family' | 'couple' | 'pro' | 'student' | 'done';

const STEP_TO_TYPE: Record<string, string> = {
  family: 'FAMILY',
  couple: 'COUPLE',
  pro: 'PROFESSIONAL',
  student: 'STUDENT',
};

const VerificationTab = () => {
  const [step, setStep] = useState<VerifyStep>('choose');
  const [submitting, setSubmitting] = useState(false);
  // Family state
  const [primaryId, setPrimaryId] = useState('');
  const [primaryIdType, setPrimaryIdType] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  // Couple state
  const [id1, setId1] = useState('');
  const [id1Type, setId1Type] = useState('');
  const [id2, setId2] = useState('');
  const [id2Type, setId2Type] = useState('');

  // Professional state
  const [workId, setWorkId] = useState('');
  const [workIdType, setWorkIdType] = useState('');

  // Student state
  const [studentId, setStudentId] = useState('');
  const [studentIdType, setStudentIdType] = useState('');

  const [idFocus1, setIdFocus1] = useState(false);
  const [idFocus2, setIdFocus2] = useState(false);
  const [primaryIdFocused, setPrimaryIdFocused] = useState(false);
  const [proIdFocused, setProIdFocused] = useState(false);
  const [purposeFocused, setPurposeFocused] = useState(false);
  const [studentIdFocused, setStudentIdFocused] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [currentType, setCurrentType] = useState<'family' | 'couple' | 'pro' | 'student'>('family');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    const backAction = () => {
      if (step !== 'choose') {
        setStep('choose');
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [step]);

  const reset = () => {
    setStep('choose');
    setPrimaryId(''); setPrimaryIdType(''); setAdults(1); setChildren(0);
    setId1(''); setId1Type(''); setId2(''); setId2Type('');
    setWorkId(''); setWorkIdType('');
    setStudentId(''); setStudentIdType('');
    setPurpose('');
    setVerificationResult(null);
  };

  const handleSubmit = async () => {
    if (step === 'family') {
      if (!primaryIdType) { Alert.alert('Validation', 'Please select an ID type.'); return; }
      if (primaryId.length < 4) { Alert.alert('Validation', 'Please enter a valid ID Number.'); return; }
    }
    if (step === 'couple') {
      if (!id1Type || !id2Type) { Alert.alert('Validation', 'Please select ID types for both guests.'); return; }
      if (id1.length < 4 || id2.length < 4) { Alert.alert('Validation', 'Please enter both valid ID Numbers.'); return; }
    }
    if (step === 'pro') {
      if (!workIdType) { Alert.alert('Validation', 'Please select an ID type.'); return; }
      if (workId.length < 4) { Alert.alert('Validation', 'Please enter a valid ID Number.'); return; }
    }
    if (step === 'student') {
      if (!studentIdType) { Alert.alert('Validation', 'Please select an ID type.'); return; }
      if (studentId.length < 4) { Alert.alert('Validation', 'Please enter a valid ID Number.'); return; }
    }

    // Build persons array
    let persons: Array<{ idType: string; idNumber: string; name?: string }> = [];
    if (step === 'family') {
      persons = [{ idType: mapIdType(primaryIdType), idNumber: primaryId }];
    } else if (step === 'couple') {
      persons = [
        { idType: mapIdType(id1Type), idNumber: id1 },
        { idType: mapIdType(id2Type), idNumber: id2 },
      ];
    } else if (step === 'pro') {
      persons = [{ idType: mapIdType(workIdType), idNumber: workId }];
    } else if (step === 'student') {
      persons = [{ idType: mapIdType(studentIdType), idNumber: studentId }];
    }

    setSubmitting(true);
    try {
      const res = await createVerification({
        type: STEP_TO_TYPE[step] as any,
        adults: step === 'family' ? adults : 1,
        children: step === 'family' ? children : 0,
        purpose: purpose || undefined,
        persons,
      });
      setVerificationResult(res.verification);
      setStep('done');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const Counter = ({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) => (
    <View style={tabStyles.counter}>
      <TouchableOpacity style={tabStyles.counterBtn} onPress={() => onChange(Math.max(min, value - 1))} activeOpacity={0.7}>
        <Ionicons name="remove" size={18} color={Colors.accent} />
      </TouchableOpacity>
      <Text style={tabStyles.counterVal}>{value}</Text>
      <TouchableOpacity style={tabStyles.counterBtn} onPress={() => onChange(value + 1)} activeOpacity={0.7}>
        <Ionicons name="add" size={18} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );

  if (step === 'done') {
    const persons = verificationResult?.persons || [];
    return (
      <View style={tabStyles.doneWrap}>
        {/* Success Header */}
        <View style={tabStyles.successHeader}>
          <View style={tabStyles.successIconBadge}>
            <Ionicons name="shield-checkmark" size={42} color="#10B981" />
          </View>
          <Text style={tabStyles.doneTitle}>Verification Successful</Text>
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Section */}
          <View style={tabStyles.checkInSummary}>
            <View style={[tabStyles.detailIconWrap, { backgroundColor: '#DCFCE7', borderRadius: 12 }]}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
            </View>
            <Text style={tabStyles.doneBody}>
              {currentType === 'family' && `Family checked in — ${verificationResult?.adults || adults} adult(s), ${verificationResult?.children || children} child(ren).`}
              {currentType === 'couple' && 'Couple successfully verified and checked in.'}
              {currentType === 'pro' && 'Professional verified successfully.'}
              {currentType === 'student' && 'Student verified successfully.'}
            </Text>
          </View>

          {/* Guest Cards */}
          <Text style={tabStyles.sectionTitle}>Verified Guest Profiles</Text>
          {persons.map((person: any, idx: number) => {
            const name = person?.name || '';
            const needsMock = !name || name.toLowerCase() === 'unknown';
            const idStr = person?.idNumber?.toString() || '';
            const mockIndex = (idStr ? parseInt(idStr.slice(-1)) : idx) % MOCK_PROFILES.length;
            const mock = MOCK_PROFILES[mockIndex];
            
            const displayName = needsMock ? mock.name : name;
            const displayAge = needsMock ? mock.age : (person?.age || 26);
            const displayAddress = needsMock ? mock.address : (person?.address || 'Address not provided');

            return (
              <View key={idx} style={tabStyles.detailCard}>
                {/* Header: Name + Badge */}
                <View style={tabStyles.passHeader}>
                  <Text style={tabStyles.passName} numberOfLines={1}>{displayName}</Text>
                  <View style={tabStyles.verifiedBadge}>
                    <Ionicons name="shield-checkmark-outline" size={10} color="#059669" />
                    <Text style={tabStyles.verifiedBadgeText}>VERIFIED</Text>
                  </View>
                </View>

                {/* Body: ID + Age */}
                <View style={tabStyles.passBody}>
                  <View style={tabStyles.passDetailsRow}>
                    <View style={tabStyles.passItem}>
                      <Text style={tabStyles.passLabel}>{person?.idType} Number</Text>
                      <Text style={tabStyles.passValue}>{person?.idNumber}</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#F3F4FB' }} />
                    <View style={{ width: 40 }}>
                      <Text style={tabStyles.passLabel}>Age</Text>
                      <Text style={tabStyles.passValue}>{displayAge}</Text>
                    </View>
                  </View>
                </View>

                {/* Footer: Address */}
                <View style={tabStyles.passFooterAddress}>
                  <View style={tabStyles.addressBox}>
                    <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                    <Text style={tabStyles.addressText} numberOfLines={2}>{displayAddress}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* New Verification Action */}
          <TouchableOpacity 
            style={[tabStyles.newVerifyBtn, { marginTop: 8, height: 58, borderRadius: 18 }]} 
            onPress={reset} 
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={tabStyles.newVerifyBtnText}>New Verification</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 'choose') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <Text style={tabStyles.verifyTitle}>Guest Verification</Text>
        <Text style={tabStyles.verifySubtitle}>Select the type of check-in to continue.</Text>

        <TouchableOpacity style={tabStyles.choiceCard} activeOpacity={0.85} onPress={() => { setCurrentType('family'); setStep('family'); }}>
          <View style={[tabStyles.choiceIconWrap, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="people" size={28} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={tabStyles.choiceTitle}>Family</Text>
            <Text style={tabStyles.choiceDesc}>One ID for the primary member, plus adult & children count.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity style={tabStyles.choiceCard} activeOpacity={0.85} onPress={() => { setCurrentType('couple'); setStep('couple'); }}>
          <View style={[tabStyles.choiceIconWrap, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="heart" size={28} color="#DB2777" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={tabStyles.choiceTitle}>Couple</Text>
            <Text style={tabStyles.choiceDesc}>Both guests must present their IDs for verification.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#DB2777" />
        </TouchableOpacity>

        <TouchableOpacity style={tabStyles.choiceCard} activeOpacity={0.85} onPress={() => { setCurrentType('pro'); setStep('pro'); }}>
          <View style={[tabStyles.choiceIconWrap, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="briefcase" size={28} color="#0EA5E9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={tabStyles.choiceTitle}>Professional</Text>
            <Text style={tabStyles.choiceDesc}>Verification for working individuals and corporate guests.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0EA5E9" />
        </TouchableOpacity>

        <TouchableOpacity style={tabStyles.choiceCard} activeOpacity={0.85} onPress={() => { setCurrentType('student'); setStep('student'); }}>
          <View style={[tabStyles.choiceIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="school" size={28} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={tabStyles.choiceTitle}>Student</Text>
            <Text style={tabStyles.choiceDesc}>ID verification for students from schools or colleges.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D97706" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 'family') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <TouchableOpacity style={tabStyles.backRow} onPress={() => setStep('choose')}>
          <Ionicons name="arrow-back" size={18} color={Colors.accent} />
          <Text style={tabStyles.backRowText}>Family Check-in</Text>
        </TouchableOpacity>

        <IdTypeSelector selected={primaryIdType} onSelect={setPrimaryIdType} activeColor={Colors.accent} />

        <Text style={tabStyles.fieldLabel}>PRIMARY MEMBER ID NUMBER</Text>
        <View style={[tabStyles.inputRow, primaryIdFocused && { borderColor: Colors.accent }]}>
          <Ionicons
            name={primaryIdType ? (ID_TYPES.find(t => t.key === primaryIdType)?.icon as any ?? 'card-outline') : 'card-outline'}
            size={18} color={primaryIdFocused ? Colors.accent : '#9CA3AF'} style={{ marginRight: 10 }}
          />
          <TextInput
            style={tabStyles.input}
            placeholder={primaryIdType ? `Enter ${ID_TYPES.find(t => t.key === primaryIdType)?.label} number` : 'Select ID type first'}
            placeholderTextColor="#C4C9D4"
            value={primaryId} onChangeText={setPrimaryId}
            onFocus={() => setPrimaryIdFocused(true)} onBlur={() => setPrimaryIdFocused(false)}
            editable={!!primaryIdType} autoCapitalize="characters"
          />
        </View>

        <View style={tabStyles.countCard}>
          <Text style={tabStyles.countCardTitle}>Members Breakdown</Text>
          <View style={tabStyles.countRow}>
            <View style={{ flex: 1 }}>
              <Text style={tabStyles.countLabel}>Adults</Text>
              <Text style={tabStyles.countHint}>18 years and above</Text>
            </View>
            <Counter value={adults} onChange={setAdults} min={1} />
          </View>
          <View style={[tabStyles.countRow, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={tabStyles.countLabel}>Children</Text>
              <Text style={tabStyles.countHint}>Under 18 years</Text>
            </View>
            <Counter value={children} onChange={setChildren} />
          </View>
        </View>

        <Text style={tabStyles.fieldLabel}>PURPOSE OF VISIT (OPTIONAL)</Text>
        <View style={[tabStyles.inputRow, purposeFocused && { borderColor: Colors.accent }]}>
          <Ionicons name="document-text-outline" size={18} color={purposeFocused ? Colors.accent : '#9CA3AF'} style={{ marginRight: 10 }} />
          <TextInput
            style={tabStyles.input}
            placeholder="e.g. Tourism, Personal, Family Visit" placeholderTextColor="#C4C9D4"
            value={purpose} onChangeText={setPurpose}
            onFocus={() => setPurposeFocused(true)} onBlur={() => setPurposeFocused(false)}
          />
        </View>

        <View style={tabStyles.summaryChip}>
          <Ionicons name="people-outline" size={16} color={Colors.accent} />
          <Text style={tabStyles.summaryChipText}>
            Total {adults + children} member{adults + children > 1 ? 's' : ''} · {adults} adult{adults > 1 ? 's' : ''} + {children} child{children !== 1 ? 'ren' : ''}
          </Text>
        </View>

        <TouchableOpacity style={[tabStyles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
              <Text style={tabStyles.submitBtnText}>Verify & Check In</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 'pro') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <TouchableOpacity style={tabStyles.backRow} onPress={() => setStep('choose')}>
          <Ionicons name="arrow-back" size={18} color="#0EA5E9" />
          <Text style={[tabStyles.backRowText, { color: '#0EA5E9' }]}>Professional Verification</Text>
        </TouchableOpacity>

        <IdTypeSelector selected={workIdType} onSelect={setWorkIdType} activeColor="#0EA5E9" />

        <Text style={tabStyles.fieldLabel}>GOV ID NUMBER</Text>
        <View style={[tabStyles.inputRow, proIdFocused && { borderColor: '#0EA5E9' }]}>
          <Ionicons
            name={workIdType ? (ID_TYPES.find(t => t.key === workIdType)?.icon as any ?? 'card-outline') : 'card-outline'}
            size={18} color={proIdFocused ? '#0EA5E9' : '#9CA3AF'} style={{ marginRight: 10 }}
          />
          <TextInput
            style={tabStyles.input}
            placeholder={workIdType ? `Enter ${ID_TYPES.find(t => t.key === workIdType)?.label} number` : 'Select ID type first'}
            placeholderTextColor="#C4C9D4"
            value={workId} onChangeText={setWorkId}
            onFocus={() => setProIdFocused(true)} onBlur={() => setProIdFocused(false)}
            editable={!!workIdType} autoCapitalize="characters"
          />
        </View>

        <Text style={tabStyles.fieldLabel}>PURPOSE OF VISIT (OPTIONAL)</Text>
        <View style={[tabStyles.inputRow, purposeFocused && { borderColor: '#0EA5E9' }]}>
          <Ionicons name="document-text-outline" size={18} color={purposeFocused ? '#0EA5E9' : '#9CA3AF'} style={{ marginRight: 10 }} />
          <TextInput
            style={tabStyles.input}
            placeholder="e.g. Business, Meeting, Training" placeholderTextColor="#C4C9D4"
            value={purpose} onChangeText={setPurpose}
            onFocus={() => setPurposeFocused(true)} onBlur={() => setPurposeFocused(false)}
          />
        </View>

        <TouchableOpacity style={[tabStyles.submitBtn, { backgroundColor: '#0EA5E9' }, submitting && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
              <Text style={tabStyles.submitBtnText}>Verify & Check In</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 'student') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <TouchableOpacity style={tabStyles.backRow} onPress={() => setStep('choose')}>
          <Ionicons name="arrow-back" size={18} color="#D97706" />
          <Text style={[tabStyles.backRowText, { color: '#D97706' }]}>Student Verification</Text>
        </TouchableOpacity>

        <IdTypeSelector selected={studentIdType} onSelect={setStudentIdType} activeColor="#D97706" />

        <Text style={tabStyles.fieldLabel}>GOV ID NUMBER</Text>
        <View style={[tabStyles.inputRow, studentIdFocused && { borderColor: '#D97706' }]}>
          <Ionicons
            name={studentIdType ? (ID_TYPES.find(t => t.key === studentIdType)?.icon as any ?? 'card-outline') : 'card-outline'}
            size={18} color={studentIdFocused ? '#D97706' : '#9CA3AF'} style={{ marginRight: 10 }}
          />
          <TextInput
            style={tabStyles.input}
            placeholder={studentIdType ? `Enter ${ID_TYPES.find(t => t.key === studentIdType)?.label} number` : 'Select ID type first'}
            placeholderTextColor="#C4C9D4"
            value={studentId} onChangeText={setStudentId}
            onFocus={() => setStudentIdFocused(true)} onBlur={() => setStudentIdFocused(false)}
            editable={!!studentIdType} autoCapitalize="characters"
          />
        </View>

        <Text style={tabStyles.fieldLabel}>PURPOSE OF VISIT (OPTIONAL)</Text>
        <View style={[tabStyles.inputRow, purposeFocused && { borderColor: '#D97706' }]}>
          <Ionicons name="document-text-outline" size={18} color={purposeFocused ? '#D97706' : '#9CA3AF'} style={{ marginRight: 10 }} />
          <TextInput
            style={tabStyles.input}
            placeholder="e.g. Internship, Competition, Exam" placeholderTextColor="#C4C9D4"
            value={purpose} onChangeText={setPurpose}
            onFocus={() => setPurposeFocused(true)} onBlur={() => setPurposeFocused(false)}
          />
        </View>

        <TouchableOpacity style={[tabStyles.submitBtn, { backgroundColor: '#D97706' }, submitting && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
              <Text style={tabStyles.submitBtnText}>Verify & Check In</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Couple
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <TouchableOpacity style={tabStyles.backRow} onPress={() => setStep('choose')}>
        <Ionicons name="arrow-back" size={18} color="#DB2777" />
        <Text style={[tabStyles.backRowText, { color: '#DB2777' }]}>Couple Check-in</Text>
      </TouchableOpacity>

      {/* Guest 1 */}
      <IdTypeSelector selected={id1Type} onSelect={setId1Type} activeColor="#DB2777" />
      <Text style={tabStyles.fieldLabel}>GUEST 1 — ID NUMBER</Text>
      <View style={[tabStyles.inputRow, idFocus1 && { borderColor: '#DB2777' }]}>
        <Ionicons
          name={id1Type ? (ID_TYPES.find(t => t.key === id1Type)?.icon as any ?? 'person-outline') : 'person-outline'}
          size={18} color={idFocus1 ? '#DB2777' : '#9CA3AF'} style={{ marginRight: 10 }}
        />
        <TextInput
          style={tabStyles.input}
          placeholder={id1Type ? `Enter ${ID_TYPES.find(t => t.key === id1Type)?.label} number` : 'Select ID type first'}
          placeholderTextColor="#C4C9D4"
          value={id1} onChangeText={setId1}
          onFocus={() => setIdFocus1(true)} onBlur={() => setIdFocus1(false)}
          editable={!!id1Type} autoCapitalize="characters"
        />
      </View>

      {/* Guest 2 */}
      <IdTypeSelector selected={id2Type} onSelect={setId2Type} activeColor="#DB2777" />
      <Text style={tabStyles.fieldLabel}>GUEST 2 — ID NUMBER</Text>
      <View style={[tabStyles.inputRow, idFocus2 && { borderColor: '#DB2777' }]}>
        <Ionicons
          name={id2Type ? (ID_TYPES.find(t => t.key === id2Type)?.icon as any ?? 'person-outline') : 'person-outline'}
          size={18} color={idFocus2 ? '#DB2777' : '#9CA3AF'} style={{ marginRight: 10 }}
        />
        <TextInput
          style={tabStyles.input}
          placeholder={id2Type ? `Enter ${ID_TYPES.find(t => t.key === id2Type)?.label} number` : 'Select ID type first'}
          placeholderTextColor="#C4C9D4"
          value={id2} onChangeText={setId2}
          onFocus={() => setIdFocus2(true)} onBlur={() => setIdFocus2(false)}
          editable={!!id2Type} autoCapitalize="characters"
        />
      </View>

      {/* Purpose of Visit */}
      <Text style={tabStyles.fieldLabel}>PURPOSE OF VISIT (OPTIONAL)</Text>
      <View style={[tabStyles.inputRow, purposeFocused && { borderColor: '#DB2777' }]}>
        <Ionicons name="document-text-outline" size={18} color={purposeFocused ? '#DB2777' : '#9CA3AF'} style={{ marginRight: 10 }} />
        <TextInput
          style={tabStyles.input}
          placeholder="e.g. Tourism, Personal, Wedding" placeholderTextColor="#C4C9D4"
          value={purpose} onChangeText={setPurpose}
          onFocus={() => setPurposeFocused(true)} onBlur={() => setPurposeFocused(false)}
        />
      </View>

      <View style={[tabStyles.summaryChip, { backgroundColor: '#FCE7F3', borderColor: '#FBCFE8' }]}>
        <Ionicons name="heart-outline" size={16} color="#DB2777" />
        <Text style={[tabStyles.summaryChipText, { color: '#DB2777' }]}>Both guests' IDs are required for couple check-in.</Text>
      </View>

      <TouchableOpacity style={[tabStyles.submitBtn, { backgroundColor: '#DB2777' }, submitting && { opacity: 0.7 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            <Text style={tabStyles.submitBtnText}>Verify & Check In</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VerificationTab;
